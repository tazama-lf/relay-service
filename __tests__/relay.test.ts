import { execute } from '../src/services/execute';
import { configuration, loggerService, transport } from '../src';
import FRMSMessage from '@tazama-lf/frms-coe-lib/lib/helpers/protobuf';

jest.mock('../src', () => ({
  configuration: { OUTPUT_TO_JSON: true, DESTINATION_TRANSPORT_TYPE: 'nats' },
  loggerService: { log: jest.fn(), error: jest.fn() },
  transport: { relay: jest.fn() },
}));

jest.mock('../src/apm', () => ({
  startTransaction: jest.fn(() => ({
    end: jest.fn(),
  })),
  startSpan: jest.fn(() => ({
    end: jest.fn(),
  })),
}));

jest.mock('@tazama-lf/frms-coe-lib/lib/helpers/protobuf', () => ({
  create: jest.fn(),
  encode: jest.fn(() => ({ finish: jest.fn(() => Buffer.from('test')) })),
}));

describe('execute', () => {
  const mockReqObj = { foo: 'bar', metaData: { traceParent: 'parent' } };

  beforeEach(() => {
    jest.clearAllMocks();
    configuration.OUTPUT_TO_JSON = true; // default

    // Reset FRMSMessage mocks to default behavior
    (FRMSMessage.create as jest.Mock).mockReturnValue({});
    (FRMSMessage.encode as jest.Mock).mockReturnValue({
      finish: jest.fn(() => Buffer.from('test')),
    });
  });

  it('logs execution', async () => {
    await execute(mockReqObj);
    expect(loggerService.log).toHaveBeenCalledWith('Executing FRMS Relay Service', 'execute');
  });

  it('relays a JSON message if OUTPUT_TO_JSON is true', async () => {
    configuration.OUTPUT_TO_JSON = true;
    await execute(mockReqObj);
    expect(transport.relay).toHaveBeenCalledTimes(1);
    expect(transport.relay).toHaveBeenCalledWith(JSON.stringify(mockReqObj));
  });

  it('relays a Protobuf message if OUTPUT_TO_JSON is false', async () => {
    configuration.OUTPUT_TO_JSON = false;
    const mockObj = {};
    const mockBuffer = Buffer.from('test');

    (FRMSMessage.create as jest.Mock).mockReturnValue(mockObj);
    (FRMSMessage.encode as jest.Mock).mockReturnValue({
      finish: jest.fn(() => mockBuffer),
    });

    await execute(mockReqObj);

    expect(FRMSMessage.create).toHaveBeenCalledWith(mockReqObj);
    expect(FRMSMessage.encode).toHaveBeenCalledWith(mockObj);
    expect(transport.relay).toHaveBeenCalledTimes(1);
    expect(transport.relay).toHaveBeenCalledWith(mockBuffer);
  });

  it('logs and does not throw on error', async () => {
    (transport.relay as jest.Mock).mockImplementation(() => {
      throw new Error('fail!');
    });
    await execute(mockReqObj);
    expect(loggerService.error).toHaveBeenCalled();
  });
});
