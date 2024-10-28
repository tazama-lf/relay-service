// Developed By Paysys Labs

import { connect, NatsConnection } from 'nats';
import amqplib, { Channel, Connection } from 'amqplib';
import axios from 'axios';
import { MessageRelayService } from '../src/services/message-relay-service';
import { config } from '../src/config/index';
import FRMSMessage from '@tazama-lf/frms-coe-lib/lib/helpers/protobuf';

// Mocking Libraries
jest.mock('nats', () => ({
  connect: jest.fn(),
}));

jest.mock('amqplib', () => ({
  connect: jest.fn(),
}));

jest.mock('axios');

jest.mock('@tazama-lf/frms-coe-lib', () => ({
  LoggerService: jest.fn().mockImplementation(() => ({
    log: jest.fn(() => Promise.resolve()),
    error: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock('@tazama-lf/frms-coe-lib/lib/helpers/protobuf', () => ({
  ...jest.requireActual('@tazama-lf/frms-coe-lib/lib/helpers/protobuf'),
  decode: jest.fn(() => ({
    transaction: {
      FIToFIPmtSts: {
        GrpHdr: {
          MsgId: 'mock-message-id',
        },
      },
    },
  })),
  toObject: jest.fn(() => ({
    transaction: {
      FIToFIPmtSts: {
        GrpHdr: {
          MsgId: 'mock-message-id',
        },
      },
    },
  })),
}));

// Setting up suite
describe('MessageRelayService', () => {
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
        server_id: 'test-server',
        version: 'test-version',
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
    (mockRabbitConn.createChannel as jest.Mock).mockResolvedValue(mockRabbitChannel);
  });

  // Clear all mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Check for initial connection and subscription
  it('should start and subscribe to NATS stream', async () => {
    await service.start();

    expect(connect).toHaveBeenCalledWith({ servers: config.serverUrl });
    expect(mockNatsConnection.subscribe).toHaveBeenCalledWith(
      config.consumerStream,
      expect.objectContaining({
        queue: config.functionName,
        callback: expect.any(Function),
      }),
    );
  });

  it('should log an error when subscribing to NATS fails during message handling', async () => {
    // Use fake timers for handling any asynchronous log operations using setTimeout
    jest.useFakeTimers();

    // Spy on the logger.error method to capture any error logs
    const loggerSpy = jest.spyOn(service['logger'], 'error');

    // Mock the NATS subscription to simulate an error during the callback
    (mockNatsConnection.subscribe as jest.Mock).mockImplementationOnce((stream, options) => {
      const msg = new Uint8Array([72, 101, 108, 108, 111]); // Mock message
      // Simulate the callback with an error
      options.callback(new Error('Test Error'), msg);
    });

    // Call the start method, which triggers the subscription
    await service.start();

    // Ensure that NATS connect was called with the right server URL
    expect(connect).toHaveBeenCalledWith({ servers: config.serverUrl });

    // Ensure the subscribe method was called with the correct parameters
    expect(mockNatsConnection.subscribe).toHaveBeenCalledWith(
      config.consumerStream,
      expect.objectContaining({
        queue: config.functionName,
        callback: expect.any(Function),
      }),
    );

    // Fast-forward the timers to allow asynchronous logs to complete
    jest.runAllTimers(); // This should run all setTimeout callbacks, including the async logs

    // Ensure that the error log was called with the expected message
    expect(loggerSpy).toHaveBeenCalledWith('[TRS]: Error receiving message: Test Error', config.functionName, undefined);

    jest.useRealTimers(); // Restore real timers after the test
  });

  // Tests for initProducer()
  //  Producer NATS
  it('should connect to NATS and log success', async () => {
    jest.useFakeTimers();
    const loggerSpy = jest.spyOn(service['logger'], 'log');
    config.destinationType = 'nats';
    config.destinationUrl = 'nats://localhost';

    const result = await service.initProducer();

    expect(connect).toHaveBeenCalledWith({
      servers: config.destinationUrl,
    });
    jest.runAllTimers();
    expect(loggerSpy).toHaveBeenCalledWith(
      '[TRS]: Connected to Client NATS: ',
      JSON.stringify(mockNatsConnection.info, null, 4),
      config.functionName,
      undefined,
    );
    expect(result).toBe(true);
    jest.useRealTimers();
  });

  it('should log an error if NATS connection fails', async () => {
    jest.useFakeTimers();
    const loggerSpy = jest.spyOn(service['logger'], 'error');
    config.destinationType = 'nats';
    (connect as jest.Mock).mockRejectedValueOnce(() => {
      throw new Error('NATS connection error');
    });

    const result = await service.initProducer();

    expect(connect).toHaveBeenCalled();
    jest.runAllTimers();
    expect(loggerSpy).toHaveBeenCalledWith('[TRS]: Failed to relay message: Connection error', config.functionName, undefined);
    expect(result).toBe(false); // Despite the error, the function still returns true
    jest.useRealTimers();
  });

  // // Producer RabbitMQ
  it('should connect to RabbitMQ, create a channel, and assert a queue', async () => {
    jest.useFakeTimers();
    const loggerSpy = jest.spyOn(service['logger'], 'log');

    config.destinationType = 'rabbitmq';
    config.destinationUrl = 'amqp://localhost';
    config.functionName = 'test-queue';

    const result = await service.initProducer();

    expect(amqplib.connect).toHaveBeenCalledWith(config.destinationUrl);
    expect(mockRabbitConn.createChannel).toHaveBeenCalled();
    expect(mockRabbitChannel.assertQueue).toHaveBeenCalledWith(config.functionName, {
      durable: false,
    });
    jest.runAllTimers();

    expect(loggerSpy).toHaveBeenCalledWith('[TRS]: Connected to Client RabbitMQ', config.functionName, undefined);
    expect(result).toBe(true);
    jest.useRealTimers();
  });

  it('should log an error if RabbitMQ connection or channel creation fails', async () => {
    jest.useFakeTimers();
    const loggerSpy = jest.spyOn(service['logger'], 'error');
    config.destinationType = 'rabbitmq';
    (amqplib.connect as jest.Mock).mockRejectedValueOnce(() => {
      throw new Error('RabbitMQ Connection Error');
    });

    const result = await service.initProducer();

    expect(amqplib.connect).toHaveBeenCalled();
    jest.runAllTimers();
    expect(loggerSpy).toHaveBeenCalledWith('[TRS]: Failed to relay message: Connection error', config.functionName, undefined);
    expect(result).toBe(false);
    jest.useRealTimers();
  });

  // // Producer REST API
  it('should log that REST is being used', async () => {
    jest.useFakeTimers();
    const loggerSpy = jest.spyOn(service['logger'], 'log');
    config.destinationType = 'rest';
    config.destinationUrl = 'http://localhost:3000';

    const result = await service.initProducer();

    jest.runAllTimers();
    expect(loggerSpy).toHaveBeenCalledWith(`[TRS]: Will publish on ${config.destinationUrl}`, config.functionName, undefined);
    expect(result).toBe(true);
    jest.useRealTimers();
  });

  it('should throw an error if unknown destination type is provided', async () => {
    config.destinationType = 'unknown';

    await expect(service.initProducer()).rejects.toThrowError(`[TRS]: Unknown destination type: ${config.destinationType}`);
  });

  // // Relay Cases

  it('should relay message to NATS', async () => {
    config.destinationType = 'nats';
    config.producerStream = 'test-producer-stream';

    await service.initProducer();
    const message = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello' in Uint8Array

    await service.relayMessage(message);

    expect(mockNatsConnection.publish).toHaveBeenCalledWith(config.producerStream, message);
  });

  it('should relay message to RabbitMQ', async () => {
    config.destinationType = 'rabbitmq';
    config.queue = 'test-queue';

    await service.initProducer();
    const message = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello' in Uint8Array

    await service.relayMessage(message);

    expect(mockRabbitChannel.sendToQueue).toHaveBeenCalledWith(config.queue, Buffer.from(message));
  });

  it('should relay message to REST API', async () => {
    config.destinationType = 'rest';
    config.destinationUrl = 'http://localhost:3000/api';

    await service.initProducer();
    const message = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello' in Uint8Array

    await service.relayMessage(message);

    expect(axios.post).toHaveBeenCalledWith(
      config.destinationUrl,
      {
        message,
      },
      expect.objectContaining({
        httpAgent: expect.objectContaining({
          keepAlive: true,
        }),
        httpsAgent: expect.objectContaining({
          keepAlive: true,
        }),
      }),
    );
  });

  it('should log an error if message relay fails on NATS', async () => {
    jest.useFakeTimers();
    const loggerSpy = jest.spyOn(service['logger'], 'error');
    config.destinationType = 'nats';

    await service.initProducer();
    (mockNatsConnection.publish as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Test Error');
    });

    const message = new Uint8Array([72, 101, 108, 108, 111]); // Dummy message
    await service.relayMessage(message);

    jest.runAllTimers();
    expect(loggerSpy).toHaveBeenCalledWith('Error relaying to NATS', new Error('Test Error'), config.functionName, 'mock-message-id');
    jest.useRealTimers();
  });

  it('should log an error if message relay fails on RabbitMQ', async () => {
    jest.useFakeTimers();
    const loggerSpy = jest.spyOn(service['logger'], 'error');
    config.destinationType = 'rabbitmq';

    await service.initProducer();
    (mockRabbitChannel.sendToQueue as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Test Error');
    });

    const message = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello' in Uint8Array
    await service.relayMessage(message);

    jest.runAllTimers();
    expect(loggerSpy).toHaveBeenCalledWith('Error relaying to RabbitMQ', new Error('Test Error'), config.functionName, 'mock-message-id');
    jest.useRealTimers();
  });

  it('should log an error if message relay fails on REST API', async () => {
    jest.useFakeTimers();
    const loggerSpy = jest.spyOn(service['logger'], 'error');
    config.destinationType = 'rest';

    await service.initProducer();
    (axios.post as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Test Error');
    });

    const message = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello' in Uint8Array
    await service.relayMessage(message);

    jest.runAllTimers();
    expect(loggerSpy).toHaveBeenCalledWith('Error relaying to REST API', new Error('Test Error'), config.functionName, 'mock-message-id');
    jest.useRealTimers();
  });

  it('should return false if no NATS connection is available', async () => {
    (connect as jest.Mock).mockResolvedValueOnce(null);
    const result = await service.start();
    expect(result).toBe(false);
  });
});
