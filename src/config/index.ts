// Developed By Paysys Labs

import * as dotenv from 'dotenv';

dotenv.config();

export const processorConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'dev',
  maxCPU: process.env.MAX_CPU ?? 4,
  functionName: process.env.FUNCTION_NAME ?? 'relay-service',
};

export const config = {
  startupType: process.env.STARTUP_TYPE ?? 'nats',
  serverUrl: process.env.SERVER_URL ?? '',
  destinationType: process.env.DESTINATION_TYPE ?? '',
  destinationUrl: process.env.DESTINATION_URL ?? '',
  producerStream: process.env.PRODUCER_STREAM ?? 'destination.subject',
  consumerStream: process.env.CONSUMER_STREAM ?? 'interdiction-service',
  functionName: process.env.FUNCTION_NAME ?? '',
  queue: process.env.QUEUE ?? '',
  jsonPayload: process.env.JSON_PAYLOAD ?? 'false',
  maxSockets: process.env.MAX_SOCKETS ?? 2500,
  subscribers: process.env.SUBSCRIBERS ?? '500',
};
