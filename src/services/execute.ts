// SPDX-License-Identifier: Apache-2.0
import { configuration, loggerService, transport } from '..';
import apm from '../apm';
import FRMSMessage from '@tazama-lf/frms-coe-lib/lib/helpers/protobuf';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- need FRMS Message object
export const execute = async (reqObj: any): Promise<void> => {
  let apmTransaction = null;
  try {
    loggerService.log('Executing FRMS Relay Service', 'execute');
    apmTransaction = apm.startTransaction(`relay-${configuration.DESTINATION_TRANSPORT_TYPE}`, {
      childOf: reqObj.metaData?.traceParent ?? undefined,
    });
    if (configuration.JSON_PAYLOAD === 'false') {
      const span = apm.startSpan('relay');
      const msgObj = FRMSMessage.create(reqObj as object);
      const msgEncoded = FRMSMessage.encode(msgObj).finish();

      await transport.relay(msgEncoded as Buffer);
      span?.end();
    } else {
      const span = apm.startSpan('relay');
      const messageBuffer = Buffer.from(JSON.stringify(reqObj));

      await transport.relay(messageBuffer);
      span?.end();
    }
  } catch (error) {
    loggerService.error(error as Error);
  } finally {
    apmTransaction?.end();
  }
};
