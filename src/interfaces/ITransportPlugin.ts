// SPDX-License-Identifier: Apache-2.0
import type { LoggerService } from '@tazama-lf/frms-coe-lib';
import { type Apm } from '@tazama-lf/frms-coe-lib/lib/services/apm';
import type { ITransportPlugin } from '@tazama-lf/frms-coe-lib/lib/interfaces/relay-service/ITransportPlugin';

export interface ITransportClass {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  new (loggerService: LoggerService, apm: Apm): ITransportPlugin;
}
