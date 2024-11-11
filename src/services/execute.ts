import { configuration, loggerService, relay } from '..';
import apm from '../apm';
import FRMSMessage from '@tazama-lf/frms-coe-lib/lib/helpers/protobuf';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- need FRMS Message object
export const execute = async (reqObj: any): Promise<void> => {
  let apmTransaction = null;
  try {
    apmTransaction = apm.startTransaction(`relay-${configuration.DESTINATION_TYPE}`, {
      childOf: reqObj.metaData?.traceParent ?? undefined,
    });
    loggerService.log(`relaying to ${configuration.DESTINATION_TYPE}`, 'relay');
    const message = FRMSMessage.create(reqObj as object);
    const messageBuffer = FRMSMessage.encode(message).finish();
    const span = apm.startSpan('relay');
    await relay.relay(messageBuffer);
    span?.end();
  } catch (error) {
  } finally {
    apmTransaction?.end();
  }
};
