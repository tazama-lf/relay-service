// Developed By Paysys Labs

import { connect } from 'nats';
import type { NatsConnection } from 'nats';
import axios from 'axios';
import http from 'http';
import https from 'https';
import amqplib from 'amqplib';
import type { Channel, Connection } from 'amqplib';
import { config, processorConfig } from '../config';
import { LoggerService } from '@tazama-lf/frms-coe-lib';
import type { ProcessorConfig } from '@tazama-lf/frms-coe-lib/lib/config/processor.config';
import FRMSMessage from '@tazama-lf/frms-coe-lib/lib/helpers/protobuf';

export class MessageRelayService {
  readonly logger = new LoggerService(processorConfig as ProcessorConfig);
  private NatsConn!: NatsConnection;
  private NatsConn_Producer?: NatsConnection;
  private RabbitConn?: Connection;
  private RabbitChannel?: Channel;
  readonly agent = new http.Agent({ keepAlive: true, maxSockets: Number(config.maxSockets) });
  readonly httpsAgent = new https.Agent({ keepAlive: true, maxSockets: Number(config.maxSockets) });

  async logAsync(message: string, id?: string): Promise<void> {
    setTimeout(() => {
      this.logger.log(message, config.functionName, id);
    }, 0);
  }

  async logErrorAsync(errorFunction: string, error: unknown, message: Uint8Array): Promise<void> {
    setTimeout(() => {
      const decodedMessage = FRMSMessage.decode(message);
      const messageObject = FRMSMessage.toObject(decodedMessage);
      this.logger.error(errorFunction, error, config.functionName, messageObject.transaction.FIToFIPmtSts.GrpHdr.MsgId as string);
    }, 0);
  }

  async logServiceErrorAsync(message: string, id?: string): Promise<void> {
    setTimeout(() => {
      this.logger.error(message, config.functionName, id);
    }, 0);
  }

  async start(): Promise<boolean> {
    this.logAsync('[TRS]: Initializing...');
    try {
      // Establish connection to Tazama's NATS
      this.NatsConn = await connect({ servers: config.serverUrl });
      if (!this.NatsConn) return await Promise.resolve(false);
      this.logAsync(`[TRS]: Connected to Tazama NATS: ${JSON.stringify(this.NatsConn.info, null, 4)}`);
      this.logAsync(`[TRS]: Consumer Stream Set To: ${config.consumerStream}`);

      await this.initProducer(); // Establish connection with client broker|stream
      let messageCount = 0;

      for (let i = 0; i < Number(config.subscribers); i++) {
        // Subscribe to the configured stream
        this.NatsConn.subscribe(config.consumerStream, {
          queue: config.functionName, // Makes sure of at most once delivery in case of multiple subscribers.
          // Callback to init producers and relay messages
          callback: (err, msg) => {
            if (err) {
              this.logServiceErrorAsync(`[TRS]: Error receiving message: ${err.message}`);
              return;
            }
            if (msg && msg.data) {
              messageCount++;
              this.logAsync(`[TRS]: Received message ${messageCount} from Tazama NATS on ${i}`);

              // Relay message to the configured broker|stream.
              void this.relayMessage(msg.data);
            }
          },
        });
      }
      return true;
    } catch (error) {
      this.logServiceErrorAsync(`[TRS]: MessageRelayService Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  // Establishes Producer Connections
  async initProducer(): Promise<boolean> {
    switch (config.destinationType.toLowerCase()) {
      case 'nats':
        try {
          this.NatsConn_Producer = await connect({
            servers: config.destinationUrl,
          });
          if (!this.NatsConn_Producer) return await Promise.resolve(false);
          this.logAsync(`[TRS]: Connected to Client NATS: ${JSON.stringify(this.NatsConn_Producer.info, null, 4)}`);
          return true;
        } catch (error) {
          this.logServiceErrorAsync(`[TRS]: Failed to relay message: ${error instanceof Error ? error.message : 'Connection error'}`);
        }
        return false;
      case 'rabbitmq':
        try {
          this.RabbitConn = await amqplib.connect(config.destinationUrl);
          if (!this.RabbitConn) return await Promise.resolve(false);
          this.RabbitChannel = await this.RabbitConn.createChannel();
          this.logAsync('[TRS]: Connected to Client RabbitMQ');
          await this.RabbitChannel.assertQueue(config.functionName, {
            durable: false,
          });
          return true;
        } catch (error) {
          this.logServiceErrorAsync(`[TRS]: Failed to relay message: ${error instanceof Error ? error.message : 'Connection error'}`);
        }
        return false;
      case 'rest':
        this.logAsync(`[TRS]: Will publish on ${config.destinationUrl}`);
        return true;
      default:
        throw new Error(`[TRS]: Unknown destination type: ${config.destinationType}`);
    }
  }

  async relayMessage(message: Uint8Array): Promise<void> {
    try {
      switch (config.destinationType.toLowerCase()) {
        case 'nats':
          await this.relayToNats(message);
          break;
        case 'rabbitmq':
          await this.relayToRabbitMQ(message);
          break;
        case 'rest':
          await this.relayToRestAPI(message);
          break;
        default:
          throw new Error(`Unknown destination type: ${config.destinationType}`);
      }
    } catch (error) {
      this.logErrorAsync('Failed to relayMessage', error, message);
    }
  }

  async relayToNats(message: Uint8Array): Promise<boolean> {
    try {
      if (!this.NatsConn_Producer) return await Promise.resolve(false);
      this.NatsConn_Producer.publish(config.producerStream, message);

      this.logAsync(`Message relayed to NATS on ${config.producerStream}`);
      return true;
    } catch (error) {
      this.logErrorAsync('Error relaying to NATS', error, message);
      return false;
    }
  }

  async relayToRabbitMQ(message: Uint8Array): Promise<boolean> {
    try {
      if (!this.RabbitConn || !this.RabbitChannel) return await Promise.resolve(false);
      this.RabbitChannel?.sendToQueue(config.queue, Buffer.from(message));

      this.logAsync(`Message relayed to RabbitMQ on ${config.queue}`);
      return true;
    } catch (error) {
      this.logErrorAsync('Error relaying to RabbitMQ', error, message);
      return false;
    }
  }

  async relayToRestAPI(message: Uint8Array): Promise<void> {
    try {
      if (config.jsonPayload === 'true') {
        const decodedMessage = FRMSMessage.decode(message);
        const messageObject = FRMSMessage.toObject(decodedMessage);
        await axios.post(config.destinationUrl, { messageObject }, { httpAgent: this.agent, httpsAgent: this.httpsAgent });
        this.logAsync('Message relayed to REST API');
      } else {
        await axios.post(config.destinationUrl, { message }, { httpAgent: this.agent, httpsAgent: this.httpsAgent });
        this.logAsync('Message relayed to REST API');
      }
    } catch (error) {
      this.logErrorAsync('Error relaying to REST API', error, message);
    }
  }
}
