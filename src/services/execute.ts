import FRMSMessage from '@tazama-lf/frms-coe-lib/lib/helpers/protobuf';
import { relay } from '..';
import apm from '../apm';

export const execute = async (reqObj: unknown): Promise<void> => {
  const span = apm.startSpan('relay');
  const message = FRMSMessage.create(reqObj as object);
  const messageBuffer = FRMSMessage.encode(message).finish();
  await relay.relay(messageBuffer);
  span?.end();
};
