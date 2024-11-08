import FRMSMessage from '@tazama-lf/frms-coe-lib/lib/helpers/protobuf';
import { relay } from '..';

export const execute = async (reqObj: unknown): Promise<void> => {
  console.log('received');
  const message = FRMSMessage.create(reqObj as object);
  const messageBuffer = FRMSMessage.encode(message).finish();
  await relay.relay(messageBuffer);
};
