// Developed By Paysys Labs

import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  startupType: process.env.STARTUP_TYPE || "nats",
  serverUrl: process.env.SERVER_URL || "",
  destinationType: process.env.DESTINATION_TYPE || "",
  destinationUrl: process.env.DESTINATION_URL || "",
  producerStream: process.env.PRODUCER_STREAM || "destination.subject",
  consumerStream: process.env.CONSUMER_STREAM || "interdiction-service",
  functionName: process.env.FUNCTION_NAME || "",
  queue: process.env.QUEUE || "",
  logLevel: process.env.LOG_LEVEL || "trace",
  subscribers: process.env.SUBSCRIBERS || "55",
};
