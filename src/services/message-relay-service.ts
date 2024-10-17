// Developed By Paysys Labs

import { connect, NatsConnection } from "nats";
import axios from "axios";
import amqplib, { Channel, Connection } from "amqplib";
import { config } from "../config";
import { CustomLoggerService } from "../utils/custom-logger-service";

export class MessageRelayService {
  private logger: CustomLoggerService | Console;
  private NatsConn!: NatsConnection;
  private NatsConn_Producer?: NatsConnection;
  private RabbitConn?: Connection;
  private RabbitChannel?: Channel;

  constructor() {
    this.logger = new CustomLoggerService();
  }

  async logAsync(message: string): Promise<void> {
    setTimeout(() => this.logger.log(message), 0);
  }

  async logErrorAsync(message: string): Promise<void> {
    setTimeout(() => this.logger.error(message), 0);
  }

  async start(): Promise<boolean | void> {
    this.logger.log("[TRS]: Initializing...");
    try {
      // Establish connection to Tazama's NATS
      this.NatsConn = await connect({ servers: config.serverUrl });
      if (!this.NatsConn) return await Promise.resolve(false);
      this.logger.log(`${JSON.stringify(this.NatsConn.info, null, 4)}`);
      this.logger.log("[TRS]: Connected to Tazama's NATS");
      this.logger.log(
        `[TRS]: Consumer Stream Set To: ${config.consumerStream}`
      );

      await this.initProducer(); // Establish connection with client broker|stream
      let messageCount = 0;

      for (let i = 0; i < Number(config.subscribers); i++) {
        // Subscribe to the configured stream
        this.NatsConn.subscribe(config.consumerStream, {
          queue: config.functionName, // Makes sure of at most once delivery in case of multiple subscribers.
          // Callback to init producers and relay messages
          callback: async (err, msg) => {
            if (err) {
              this.logErrorAsync(
                `[TRS]: Error receiving message: ${err.message}`
              );
              return;
            }
            if (msg && msg.data) {
              messageCount++;
              this.logAsync(
                `[TRS]: Received message ${messageCount} from Tazama NATS on ${i}`
              );

              // Relay message to the configured broker|stream.
              await this.relayMessage(msg.data);
            }
          },
        });
      }
    } catch (error) {
      this.logErrorAsync(
        `[TRS]: MessageRelayService Failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Establishes Producer Connections
  async initProducer(): Promise<boolean> {
    switch (config.destinationType.toLowerCase()) {
      case "nats":
        try {
          this.NatsConn_Producer = await connect({
            servers: config.destinationUrl,
          });
          if (!this.NatsConn_Producer) return await Promise.resolve(false);
          this.logger.log(
            `${JSON.stringify(this.NatsConn_Producer.info, null, 4)}`
          );
          this.logger.log(`[TRS]: Connected to Client's NATS`);
          return true;
        } catch (error) {
          this.logger.error(
            `[TRS]: Failed to relay message: ${
              error instanceof Error ? error.message : "Connection error"
            }`
          );
        }
        return false;
      case "rabbitmq":
        try {
          this.RabbitConn = await amqplib.connect(config.destinationUrl);
          if (!this.RabbitConn) return await Promise.resolve(false);
          this.logger.log(`[TRS]: Connected to Client's RabbitMQ`);
          this.RabbitChannel = await this.RabbitConn.createChannel();
          this.logger.log(`[TRS]: Created RabbitMQ Channel`);
          await this.RabbitChannel.assertQueue(config.functionName, {
            durable: false,
          });
          return true;
        } catch (error) {
          this.logger.error(
            `[TRS]: Failed to relay message: ${
              error instanceof Error ? error.message : "Connection error"
            }`
          );
        }
        return false;
      case "rest":
        this.logger.log(`[TRS]: Will publish on ${config.destinationUrl}`);
        return true;
      default:
        throw new Error(
          `[TRS]: Unknown destination type: ${config.destinationType}`
        );
    }
  }

  async relayMessage(message: Uint8Array): Promise<boolean | void> {
    try {
      switch (config.destinationType.toLowerCase()) {
        case "nats":
          await this.relayToNats(message);
          break;
        case "rabbitmq":
          await this.relayToRabbitMQ(message);
          break;
        case "rest":
          await this.relayToRestAPI(message);
          break;
        default:
          throw new Error(
            `Unknown destination type: ${config.destinationType}`
          );
      }
    } catch (error) {
      this.logger.error(
        `Failed to relay message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async relayToNats(message: Uint8Array): Promise<boolean | void> {
    try {
      if (!this.NatsConn_Producer) return await Promise.resolve(false);
      this.NatsConn_Producer.publish(config.producerStream, message);

      this.logAsync(`Message relayed to NATS on ${config.producerStream}`);
    } catch (error) {
      this.logger.error(
        `Error relaying to NATS: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async relayToRabbitMQ(message: Uint8Array): Promise<boolean | void> {
    try {
      if (!this.RabbitConn || !this.RabbitChannel)
        return await Promise.resolve(false);
      this.RabbitChannel?.sendToQueue(config.queue, Buffer.from(message));

      this.logAsync(`Message relayed to RabbitMQ on ${config.queue}`);
    } catch (error) {
      this.logger.error(
        `Error relaying to RabbitMQ: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async relayToRestAPI(message: Uint8Array): Promise<boolean | void> {
    try {
      await axios.post(config.destinationUrl, { message });
      this.logAsync(`Message relayed to REST API`);
    } catch (error) {
      this.logger.error(
        `Error relaying to REST API: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
