"use strict";
// import { IStartupService, StartupFactory } from '@frmscoe/frms-coe-startup-lib';
// import { connect, NatsConnection } from 'nats';
// import axios from 'axios';
// import amqplib from 'amqplib';
// import { config } from '../config';
// import { CustomLoggerService } from '../utils/custom-logger-service';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRelayService = void 0;
// export class MessageRelayService {
//   private startupFactory: IStartupService;
//   private logger: CustomLoggerService;
//   private natsConnection4222: NatsConnection | null = null;  // First NATS server (4222)
//   private natsConnection4223: NatsConnection | null = null;  // Second NATS server (4223)
//   constructor(private subscriberId: number) {
//     console.log("Hello from constructor");
//     this.logger = new CustomLoggerService();
//     this.startupFactory = new StartupFactory();
//   }
//   async start() {
//     console.log("Hello from start method");
//     try {
//       await this.startupFactory.init(
//         (reqObj: unknown) => this.relayMessage(reqObj as Uint8Array),
//         this.logger,
//         [config.consumerStream],
//         config.producerStream
//       );
//       console.log("After startupFactory.init");
//       // Establish connection to the first NATS server (4222)
//       this.natsConnection4222 = await connect({ servers: config.serverUrl });
//       console.log("Connected to NATS server 4222");
//       // Subscribe to NATS subject on the first server (4222) with queue group to ensure message processing by only one subscriber
//       this.natsConnection4222.subscribe(config.consumerStream, {
//         queue: 'message-relay-queue-group', // Queue group name
//         callback: async (err, msg) => {
//           if (err) {
//             this.logger.error(`Error receiving message: ${err.message}`);
//             console.error(`Error receiving message: ${err.message}`);
//             return;
//           }
//           if (msg && msg.data) {
//             console.log("Received a message from NATS 4222:", new TextDecoder().decode(msg.data));
//             // Conditionally establish connection to the second NATS server (4223)
//             if (config.destinationType.toLowerCase() === 'nats') {
//               if (!this.natsConnection4223) {
//                 this.natsConnection4223 = await connect({ servers: config.destinationUrl });
//                 console.log("Connected to NATS server 4223");
//               }
//               await this.relayToNats(msg.data);  // Relay to the second NATS server (4223)
//             } else {
//               await this.relayMessage(msg.data);
//             }
//           }
//         }
//       });
//     } catch (error) {
//       this.logger.error(`Failed to start subscriber ${this.subscriberId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
//       console.error(`Failed to start subscriber ${this.subscriberId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }
//   async relayMessage(message: Uint8Array) {
//     const messageStr = new TextDecoder().decode(message);
//     try {
//       await this.logger.log(`Received message: ${messageStr} from subscriber ${this.subscriberId}`);
//       switch (config.destinationType.toLowerCase()) {
//         case 'rest':
//           await this.relayToRestAPI(messageStr);
//           break;
//         case 'nats':
//           await this.relayToNats(message);
//           break;
//         case 'rabbitmq':
//           await this.relayToRabbitMQ(messageStr);
//           break;
//         default:
//           throw new Error(`Unknown destination type: ${config.destinationType}`);
//       }
//       await this.logger.log(`Message relayed to ${config.destinationType} by subscriber ${this.subscriberId}`);
//     } catch (error) {
//       await this.logger.error(`Failed to relay message: ${error instanceof Error ? error.message : 'Unknown error'}`);
//       console.error(`Failed to relay message: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }
//   async relayToRestAPI(message: string) {
//     try {
//       await axios.post(config.destinationUrl, { message });
//       await this.logger.log('Message relayed to REST API');
//     } catch (error) {
//       await this.logger.error(`Error relaying to REST API: ${error instanceof Error ? error.message : 'Unknown error'}`);
//       console.error(`Error relaying to REST API: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }
//   async relayToNats(message: Uint8Array) {
//     if (!this.natsConnection4223) {
//       await this.logger.error('NATS connection to server 4223 not initialized');
//       console.error('NATS connection to server 4223 not initialized');
//       return;
//     }
//     try {
//       await this.natsConnection4223.publish(config.producerStream, message);
//       await this.logger.log('Message relayed to NATS 4223');
//     } catch (error) {
//       await this.logger.error(`Error relaying to NATS: ${error instanceof Error ? error.message : 'Unknown error'}`);
//       console.error(`Error relaying to NATS: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }
//   async relayToRabbitMQ(message: string) {
//     try {
//       const connection = await amqplib.connect(config.destinationUrl);
//       const channel = await connection.createChannel();
//       const queue = 'message-queue';
//       await channel.assertQueue(queue, { durable: false });
//       channel.sendToQueue(queue, Buffer.from(message));
//       await channel.close();
//       await connection.close();
//       await this.logger.log('Message relayed to RabbitMQ');
//     } catch (error) {
//       await this.logger.error(`Error relaying to RabbitMQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
//       console.error(`Error relaying to RabbitMQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }
// }
// // Example usage to keep the service running:
// (async () => {
//   const relayService = new MessageRelayService(0);
//   await relayService.start();
// })();
const frms_coe_startup_lib_1 = require("@frmscoe/frms-coe-startup-lib");
const nats_1 = require("nats");
const axios_1 = __importDefault(require("axios"));
const amqplib_1 = __importDefault(require("amqplib"));
const config_1 = require("../config");
const custom_logger_service_1 = require("../utils/custom-logger-service");
class MessageRelayService {
    constructor() {
        this.natsConnection4222 = null; // First NATS server (4222)
        this.natsConnection4223 = null; // Second NATS server (4223)
        this.logger = new custom_logger_service_1.CustomLoggerService();
        this.startupFactory = new frms_coe_startup_lib_1.StartupFactory();
        this.numberOfSubscribers = parseInt(config_1.config.subscribers, 10); // Get number of subscribers from config
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Hello from start method");
            try {
                yield this.startupFactory.init((reqObj) => this.relayMessage(reqObj), this.logger, [config_1.config.consumerStream], config_1.config.producerStream);
                console.log("After startupFactory.init");
                // Establish connection to the first NATS server (4222)
                this.natsConnection4222 = yield (0, nats_1.connect)({ servers: config_1.config.serverUrl });
                console.log("Connected to NATS server 4222");
                // Use a single queue group for all subscribers
                const queueGroup = `message-relay-queue-group`;
                // Subscribe to NATS subject on the first server (4222) with the queue group
                for (let i = 0; i < this.numberOfSubscribers; i++) {
                    this.natsConnection4222.subscribe(config_1.config.consumerStream, {
                        queue: queueGroup,
                        callback: (err, msg) => __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                this.logger.error(`Error receiving message for subscriber ${i}: ${err.message}`);
                                console.error(`Error receiving message for subscriber ${i}: ${err.message}`);
                                return;
                            }
                            if (msg && msg.data) {
                                const messageContent = new TextDecoder().decode(msg.data);
                                console.log(`Subscriber ${i} received a message from NATS 4222: ${messageContent}`);
                                // Conditionally establish connection to the second NATS server (4223)
                                if (config_1.config.destinationType.toLowerCase() === 'nats') {
                                    if (!this.natsConnection4223) {
                                        this.natsConnection4223 = yield (0, nats_1.connect)({ servers: config_1.config.destinationUrl });
                                        console.log(`Connected to NATS server 4223 for subscriber ${i}`);
                                    }
                                    console.log(`Subscriber ${i} is relaying the message to NATS 4223: ${messageContent}`);
                                    yield this.relayToNats(msg.data); // Relay to the second NATS server (4223)
                                }
                                else {
                                    console.log(`Subscriber ${i} is processing the message: ${messageContent}`);
                                    yield this.relayMessage(msg.data);
                                }
                            }
                        })
                    });
                }
            }
            catch (error) {
                this.logger.error(`Failed to start MessageRelayService: ${error instanceof Error ? error.message : 'Unknown error'}`);
                console.error(`Failed to start MessageRelayService: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    relayMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageStr = new TextDecoder().decode(message);
            try {
                yield this.logger.log(`Received message: ${messageStr}`);
                switch (config_1.config.destinationType.toLowerCase()) {
                    case 'rest':
                        yield this.relayToRestAPI(messageStr);
                        break;
                    case 'nats':
                        yield this.relayToNats(message);
                        break;
                    case 'rabbitmq':
                        yield this.relayToRabbitMQ(messageStr);
                        break;
                    default:
                        throw new Error(`Unknown destination type: ${config_1.config.destinationType}`);
                }
                yield this.logger.log(`Message relayed to ${config_1.config.destinationType}`);
            }
            catch (error) {
                yield this.logger.error(`Failed to relay message: ${error instanceof Error ? error.message : 'Unknown error'}`);
                console.error(`Failed to relay message: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    relayToRestAPI(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield axios_1.default.post(config_1.config.destinationUrl, { message });
                yield this.logger.log(`Message relayed to REST API`);
            }
            catch (error) {
                yield this.logger.error(`Error relaying to REST API: ${error instanceof Error ? error.message : 'Unknown error'}`);
                console.error(`Error relaying to REST API: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    relayToNats(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.natsConnection4223) {
                yield this.logger.error(`NATS connection to server 4223 not initialized`);
                console.error(`NATS connection to server 4223 not initialized`);
                return;
            }
            try {
                yield this.natsConnection4223.publish(config_1.config.producerStream, message);
                yield this.logger.log(`Message relayed to NATS 4223`);
            }
            catch (error) {
                yield this.logger.error(`Error relaying to NATS: ${error instanceof Error ? error.message : 'Unknown error'}`);
                console.error(`Error relaying to NATS: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    relayToRabbitMQ(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield amqplib_1.default.connect(config_1.config.destinationUrl);
                const channel = yield connection.createChannel();
                const queue = 'message-queue';
                yield channel.assertQueue(queue, { durable: false });
                channel.sendToQueue(queue, Buffer.from(message));
                yield channel.close();
                yield connection.close();
                yield this.logger.log(`Message relayed to RabbitMQ`);
            }
            catch (error) {
                yield this.logger.error(`Error relaying to RabbitMQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
                console.error(`Error relaying to RabbitMQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
}
exports.MessageRelayService = MessageRelayService;
// Example usage to keep the service running:
(() => __awaiter(void 0, void 0, void 0, function* () {
    const relayService = new MessageRelayService();
    yield relayService.start();
}))();
