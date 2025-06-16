import { execute } from '../src/services/execute';
import { configuration, loggerService, transport } from '../src';
import FRMSMessage from '@tazama-lf/frms-coe-lib/lib/helpers/protobuf';

jest.mock('../src', () => ({
  configuration: { JSON_PAYLOAD: 'true', DESTINATION_TRANSPORT_TYPE: 'nats' },
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
    configuration.JSON_PAYLOAD = 'true'; // default
  });

  it('logs execution', async () => {
    await execute(mockReqObj);
    expect(loggerService.log).toHaveBeenCalledWith('Executing FRMS Relay Service', 'execute');
  });

  it('relays a JSON message if JSON_PAYLOAD is "true"', async () => {
    configuration.JSON_PAYLOAD = 'true';
    await execute(mockReqObj);
    expect(transport.relay).toHaveBeenCalledTimes(1);
    const bufferArg = (transport.relay as jest.Mock).mock.calls[0][0];
    expect(bufferArg.toString()).toContain('"foo":"bar"');
  });

  it('relays a Protobuf message if JSON_PAYLOAD is "false"', async () => {
    configuration.JSON_PAYLOAD = 'false';
    (FRMSMessage.create as jest.Mock).mockReturnValue({});
    (FRMSMessage.encode as jest.Mock).mockReturnValue({
      finish: jest.fn(() => Buffer.from('test')),
    });
    await execute(mockReqObj);
    expect(FRMSMessage.create).toHaveBeenCalledWith(mockReqObj);
    expect(FRMSMessage.encode).toHaveBeenCalled();
    expect(transport.relay).toHaveBeenCalledTimes(1);
    const bufferArg = (transport.relay as jest.Mock).mock.calls[0][0];
    expect(bufferArg.equals(Buffer.from('test'))).toBe(true);
  });

  it('logs and does not throw on error', async () => {
    (transport.relay as jest.Mock).mockImplementation(() => {
      throw new Error('fail!');
    });
    await execute(mockReqObj);
    expect(loggerService.error).toHaveBeenCalled();
  });
});
