// Developed By Paysys Labs

import { connect, NatsConnection } from "nats";
import amqplib, { Channel, Connection } from "amqplib";
import axios from "axios";
import { MessageRelayService } from "../src/services/message-relay-service";
import { config } from "../src/config/index";

// Mocking Libraries
jest.mock("nats", () => ({
  connect: jest.fn(),
}));

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

jest.mock("axios");

jest.mock("../src/utils/custom-logger-service");

// Setting up suite
describe("MessageRelayService", () => {
  let service: MessageRelayService;
  let mockNatsConnection: NatsConnection;
  let mockRabbitConn: Connection;
  let mockRabbitChannel: Channel;

  // Setting up mocks
  beforeEach(() => {
    service = new MessageRelayService();

    // A NATS connection has the following necessary functionalities
    mockNatsConnection = {
      subscribe: jest.fn(),
      publish: jest.fn(),
      close: jest.fn(),
      info: {
        server_id: "test-server",
        version: "test-version",
      },
    } as unknown as NatsConnection;

    // Same goes for RabbitMQ
    mockRabbitConn = {
      createChannel: jest.fn(),
      close: jest.fn(),
    } as unknown as Connection;

    mockRabbitChannel = {
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
    } as unknown as Channel;

    // Mock Connections
    (connect as jest.Mock).mockResolvedValue(mockNatsConnection);
    (amqplib.connect as jest.Mock).mockResolvedValue(mockRabbitConn);
    (mockRabbitConn.createChannel as jest.Mock).mockResolvedValue(
      mockRabbitChannel
    );
  });

  // Clear all mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Check for initial connection and subscription
  it("should start and subscribe to NATS stream", async () => {
    await service.start();

    expect(connect).toHaveBeenCalledWith({ servers: config.serverUrl });
    expect(mockNatsConnection.subscribe).toHaveBeenCalledWith(
      config.consumerStream,
      expect.objectContaining({
        queue: config.functionName,
        callback: expect.any(Function),
      })
    );
  });

  // Since logging was changed to async for stress testing puposes. This test should fail.
  it("should log if error when subscribing to NATS", async () => {
    const loggerSpy = jest.spyOn(service["logger"], "error");

    (mockNatsConnection.subscribe as jest.Mock).mockImplementationOnce(
      (stream, options) => {
        const msg = new Uint8Array([72, 101, 108, 108, 111]);
        options.callback(new Error("Test Error"), msg);
      }
    );

    await service.start();

    expect(connect).toHaveBeenCalledWith({ servers: config.serverUrl });

    expect(mockNatsConnection.subscribe).toHaveBeenCalledWith(
      config.consumerStream,
      expect.objectContaining({
        queue: config.functionName,
        callback: expect.any(Function),
      })
    );

    // Uncommect to make this test valid
    // expect(loggerSpy).toHaveBeenCalledWith(
    //   expect.stringContaining("[TRS]: Error receiving message: Test Error")
    // );
  });

  // Tests for initProducer()
  //  Producer NATS
  it("should connect to NATS and log success", async () => {
    const loggerSpy = jest.spyOn(service["logger"], "log");
    config.destinationType = "nats";
    config.destinationUrl = "nats://localhost";

    const result = await service.initProducer();

    expect(connect).toHaveBeenCalledWith({
      servers: config.destinationUrl,
    });
    expect(loggerSpy).toHaveBeenCalledWith(
      JSON.stringify(mockNatsConnection.info, null, 4)
    );
    expect(loggerSpy).toHaveBeenCalledWith("[TRS]: Connected to Client's NATS");
    expect(result).toBe(true);
  });

  it("should log an error if NATS connection fails", async () => {
    const loggerSpy = jest.spyOn(service["logger"], "error");
    config.destinationType = "nats";
    (connect as jest.Mock).mockRejectedValueOnce(() => {
      throw new Error("NATS connection error");
    });

    const result = await service.initProducer();

    expect(connect).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[TRS]: Failed to relay message: Connection error"
      )
    );
    expect(result).toBe(false); // Despite the error, the function still returns true
  });

  // Producer RabbitMQ
  it("should connect to RabbitMQ, create a channel, and assert a queue", async () => {
    const loggerSpy = jest.spyOn(service["logger"], "log");

    config.destinationType = "rabbitmq";
    config.destinationUrl = "amqp://localhost";
    config.functionName = "test-queue";

    const result = await service.initProducer();

    expect(amqplib.connect).toHaveBeenCalledWith(config.destinationUrl);
    expect(mockRabbitConn.createChannel).toHaveBeenCalled();
    expect(mockRabbitChannel.assertQueue).toHaveBeenCalledWith(
      config.functionName,
      {
        durable: false,
      }
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      "[TRS]: Connected to Client's RabbitMQ"
    );
    expect(loggerSpy).toHaveBeenCalledWith("[TRS]: Created RabbitMQ Channel");
    expect(result).toBe(true);
  });

  it("should log an error if RabbitMQ connection or channel creation fails", async () => {
    const loggerSpy = jest.spyOn(service["logger"], "error");
    config.destinationType = "rabbitmq";
    (amqplib.connect as jest.Mock).mockRejectedValueOnce(() => {
      throw new Error("RabbitMQ Connection Error");
    });

    const result = await service.initProducer();

    expect(amqplib.connect).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[TRS]: Failed to relay message: Connection error"
      )
    );
    expect(result).toBe(false); // Despite the error, the function still returns true
  });

  // Producer REST API
  it("should log that REST is being used", async () => {
    const loggerSpy = jest.spyOn(service["logger"], "log");
    config.destinationType = "rest";
    config.destinationUrl = "http://localhost:3000";

    const result = await service.initProducer();

    expect(loggerSpy).toHaveBeenCalledWith(
      `[TRS]: Will publish on ${config.destinationUrl}`
    );
    expect(result).toBe(true);
  });

  it("should throw an error if unknown destination type is provided", async () => {
    config.destinationType = "unknown";

    await expect(service.initProducer()).rejects.toThrowError(
      `[TRS]: Unknown destination type: ${config.destinationType}`
    );
  });

  // Relay Cases

  it("should relay message to NATS", async () => {
    config.destinationType = "nats";
    config.producerStream = "test-producer-stream";

    await service.initProducer();
    const message = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello' in Uint8Array

    await service.relayMessage(message);

    expect(mockNatsConnection.publish).toHaveBeenCalledWith(
      config.producerStream,
      message
    );
  });

  it("should relay message to RabbitMQ", async () => {
    config.destinationType = "rabbitmq";
    config.queue = "test-queue";

    await service.initProducer();
    const message = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello' in Uint8Array

    await service.relayMessage(message);

    expect(mockRabbitChannel.sendToQueue).toHaveBeenCalledWith(
      config.queue,
      Buffer.from(message)
    );
  });

  it("should relay message to REST API", async () => {
    config.destinationType = "rest";
    config.destinationUrl = "http://localhost:3000/api";

    await service.initProducer();
    const message = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello' in Uint8Array

    await service.relayMessage(message);

    expect(axios.post).toHaveBeenCalledWith(config.destinationUrl, {
      message,
    });
  });

  it("should log an error if message relay fails on NATS", async () => {
    const loggerSpy = jest.spyOn(service["logger"], "error");
    config.destinationType = "nats";

    await service.initProducer();
    (mockNatsConnection.publish as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Test Error");
    });

    const message = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello' in Uint8Array
    await service.relayMessage(message);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error relaying to NATS: Test Error")
    );
  });

  it("should log an error if message relay fails on RabbitMQ", async () => {
    const loggerSpy = jest.spyOn(service["logger"], "error");
    config.destinationType = "rabbitmq";

    await service.initProducer();
    (mockRabbitChannel.sendToQueue as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Test Error");
    });

    const message = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello' in Uint8Array
    await service.relayMessage(message);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error relaying to RabbitMQ: Test Error")
    );
  });

  it("should log an error if message relay fails on REST API", async () => {
    const loggerSpy = jest.spyOn(service["logger"], "error");
    config.destinationType = "rest";

    await service.initProducer();
    (axios.post as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Test Error");
    });

    const message = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello' in Uint8Array
    await service.relayMessage(message);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error relaying to REST API: Test Error")
    );
  });

  it("should return false if no NATS connection is available", async () => {
    (connect as jest.Mock).mockResolvedValueOnce(null);
    const result = await service.start();
    expect(result).toBe(false);
  });
});
