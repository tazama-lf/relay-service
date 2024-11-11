// Developed By Paysys Labs
import { Pacs002 } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import { relay } from '../src/index';
import { execute } from '../src/services/execute';

jest.mock('@tazama-lf/frms-coe-lib', () => ({
  LoggerService: jest.fn().mockImplementation(() => ({
    log: jest.fn(() => Promise.resolve()),
    error: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock('@tazama-lf/frms-coe-startup-lib/lib/services/natsRelayService', () => {
  return {
    NatsRelay: jest.fn().mockImplementation(() => {
      return {
        init: jest.fn(() => {}),
        relay: jest.fn(() => {}),
      };
    }),
  };
});

jest.mock('@tazama-lf/frms-coe-startup-lib/lib/services/restRelayService', () => {
  return {
    RestRelay: jest.fn().mockImplementation(() => {
      return {
        init: jest.fn(() => {}),
        relay: jest.fn(() => {}),
      };
    }),
  };
});

jest.mock('@tazama-lf/frms-coe-startup-lib/lib/services/rabbitMQRelayService', () => {
  return {
    RabbitRelay: jest.fn().mockImplementation(() => {
      return {
        init: jest.fn(() => {}),
        relay: jest.fn(() => {}),
      };
    }),
  };
});

const mock = jest.createMockFromModule('@tazama-lf/frms-coe-lib/lib/helpers/protobuf');

// jest.mock('@tazama-lf/frms-coe-lib/lib/helpers/protobuf', () => ({
//     create: jest.fn().mockReturnValue(12),
//     encode: jest.fn().mockReturnValue({
//       finish: jest.fn()
//     }),
// }));

const getMockTransaction = () => {
  const jquote = JSON.parse(
    '{"TxTp":"pacs.002.001.12","FIToFIPmtSts":{"GrpHdr":{"MsgId":"30bea71c5a054978ad0da7f94b2a40e9789","CreDtTm":"${new Date().toISOString()}"},"TxInfAndSts":{"OrgnlInstrId":"5ab4fc7355de4ef8a75b78b00a681ed2255","OrgnlEndToEndId":"2c516801007642dfb89294dde","TxSts":"ACCC","ChrgsInf":[{"Amt":{"Amt":307.14,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}}},{"Amt":{"Amt":153.57,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}}},{"Amt":{"Amt":30.71,"Ccy":"USD"},"Agt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}],"AccptncDtTm":"2021-12-03T15:24:26.000Z","InstgAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp001"}}},"InstdAgt":{"FinInstnId":{"ClrSysMmbId":{"MmbId":"dfsp002"}}}}}}',
  );
  const quote: Pacs002 = Object.assign({}, jquote);
  return quote;
};

// Setting up suite
describe('MessageRelayService', () => {
  let responseSpy: jest.SpyInstance;

  // Clear all mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Check for initial connection and subscription
  it('should relay message', async () => {
    responseSpy = jest.spyOn(relay, 'relay').mockImplementation((response: unknown, subject?: string[] | undefined) => {
      return Promise.resolve();
    });

    await execute({ transaction: getMockTransaction() });

    expect(responseSpy).toHaveBeenCalledTimes(1);
  });
});
