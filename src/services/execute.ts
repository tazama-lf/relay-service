// SPDX-License-Identifier: Apache-2.0
import type { MetaData } from '@tazama-lf/frms-coe-lib/lib/interfaces/metaData';
import { configuration, loggerService, transport } from '..';
import apm from '../apm';
import FRMSMessage from '@tazama-lf/frms-coe-lib/lib/helpers/protobuf';

export const execute = async (reqObj: unknown): Promise<void> => {
  let apmTransaction = null;
  let traceParent;

  if (
    typeof reqObj === 'object' &&
    reqObj !== null &&
    'metaData' in reqObj &&
    typeof (reqObj as { metaData?: { traceParent?: string } }).metaData === 'object'
  ) {
    const { traceParent: tracer } = reqObj.metaData as MetaData;
    traceParent = tracer ?? undefined;
  }
  try {
    loggerService.log('Executing FRMS Relay Service', 'execute');
    apmTransaction = apm.startTransaction(`relay-${configuration.DESTINATION_TRANSPORT_TYPE}`, {
      childOf: traceParent,
    });
    const span = apm.startSpan('relay');
    if (!configuration.OUTPUT_TO_JSON) {
      const msgObj = FRMSMessage.create(reqObj as object);
      const msgEncoded = FRMSMessage.encode(msgObj).finish();

      await transport.relay(msgEncoded as Buffer);
    } else {
      await transport.relay(JSON.stringify(reqObj));
    }
    span?.end();
  } catch (error) {
    loggerService.error(error as Error);
  } finally {
    apmTransaction?.end();
  }
};
