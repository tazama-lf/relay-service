import { execute } from '../src/services/execute';
import { configuration, loggerService, transport } from '../src';
import FRMSMessage from '@tazama-lf/frms-coe-lib/lib/helpers/protobuf';
import apm from '../src/apm';

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

  // it('starts and ends an APM transaction', async () => {
  //   await execute(mockReqObj);
  //   expect(apm.startTransaction).toHaveBeenCalledWith('relay-nats', { childOf: 'parent' });
  //   // Transaction's end() should have been called in finally
  //   const tx = (apm.startTransaction as jest.Mock).mock.results[0].value;
  //   expect(tx.end).toHaveBeenCalled();
  // });

  it('relays a JSON message if JSON_PAYLOAD is "true"', async () => {
    configuration.JSON_PAYLOAD = 'true';
    await execute(mockReqObj);
    expect(transport.relay).toHaveBeenCalledTimes(1);
    const bufferArg = (transport.relay as jest.Mock).mock.calls[0][0];
    expect(bufferArg.toString()).toContain('"foo":"bar"');
  });

  it('relays a Protobuf message if JSON_PAYLOAD is "false"', async () => {
    configuration.JSON_PAYLOAD = 'false';
    // Mock encode().finish() to return Buffer.from('test')
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

  // it('starts and ends an APM span for both branches', async () => {
  //   await execute(mockReqObj); // JSON branch
  //   expect(apm.startSpan).toHaveBeenCalled();
  //   const span = (apm.startSpan as jest.Mock).mock.results[0].value;
  //   expect(span.end).toHaveBeenCalled();

  //   configuration.JSON_PAYLOAD = 'false';
  //   await execute(mockReqObj); // Protobuf branch
  //   // The mock resets above, so just check .end was called again
  //   const span2 = (apm.startSpan as jest.Mock).mock.results[1].value;
  //   expect(span2.end).toHaveBeenCalled();
  // });

  it('logs and does not throw on error', async () => {
    (transport.relay as jest.Mock).mockImplementation(() => {
      throw new Error('fail!');
    });
    await execute(mockReqObj);
    expect(loggerService.error).toHaveBeenCalled();
    // Should not throw
  });
});
// Developed By Paysys Labs
// import { Pacs002 } from '@tazama-lf/frms-coe-lib/lib/interfaces';
// import { execute } from '../src/services/execute';
// import { transport } from '../src';
// import apm from '../src/apm';

// // Mocks must be below mockTransport
// jest.mock('@tazama-lf/frms-coe-lib', () => ({
//   LoggerService: jest.fn().mockImplementation(() => ({
//     log: jest.fn(() => Promise.resolve()),
//     error: jest.fn(() => Promise.resolve()),
//   })),
// }));

// jest.mock('../src', () => ({
//   loggerService: {
//     log: jest.fn(),
//     error: jest.fn(),
//   },
//   configuration: {
//     DESTINATION_TRANSPORT_TYPE: 'test',
//     JSON_PAYLOAD: 'true',
//   },
//   transport: {
//     init: jest.fn(() => Promise.resolve()),
//     relay: jest.fn(() => Promise.resolve()),
//   },
// }));

// jest.mock('../src/apm', () => ({
//   __esModule: true,
//   default: {
//     startTransaction: jest.fn().mockReturnValue({
//       end: jest.fn(),
//     }),
//     startSpan: jest.fn().mockReturnValue({
//       end: jest.fn(),
//     }),
//   },
// }));

// jest.mock('@tazama-lf/frms-coe-lib/lib/helpers/protobuf', () => ({
//   create: jest.fn().mockReturnValue({}),
//   encode: jest.fn().mockReturnValue({
//     finish: jest.fn().mockReturnValue(Buffer.from('test')),
//   }),
// }));

// const getMockTransaction = () => {
//   const jquote = JSON.parse(
//     '{"TxTp":"pacs.002.001.12","FIToFIPmtSts":{"GrpHdr":{"MsgId":"30bea71c5a054978ad0da7f94b2a40e9789","CreDtTm":"${new Date().toISOString()}"},"TxInfAndSts":{"OrgnlInstrId":"5ab4fc7355de4ef8a75b78b00a681ed2255","OrgnlEndToEndId":"2c516801007642dfb89294dde","TxSts":"ACCC","ChrgsInf":[{"Amt":{"Amt":307.14,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}}},{"Amt":{"Amt":153.57,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}}},{"Amt":{"Amt":30.71,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}],"AccptncDtTm":"2021-12-03T15:24:26.000Z","InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}},"InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}}}',
//   );
//   const quote: Pacs002 = Object.assign({}, jquote);
//   return quote;
// };

// describe('MessageRelayService', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should relay message', async () => {
//     await execute({ transaction: getMockTransaction() });
//     expect(apm.startTransaction).toHaveBeenCalledWith(
//       'relay-test',
//       expect.objectContaining({
//         childOf: undefined,
//       }),
//     );
//     expect(apm.startSpan).toHaveBeenCalledWith('relay');
//     expect(transport.relay).toHaveBeenCalledTimes(1);
//     expect(transport.relay).toHaveBeenCalledWith(expect.any(Buffer));
//   });
// });
