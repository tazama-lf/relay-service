import type { LoggerService } from '@tazama-lf/frms-coe-lib';
import { type Apm } from '@tazama-lf/frms-coe-lib/lib/services/apm';

export interface ITransport {
  init: () => Promise<void>;
  relay: (data: Uint8Array) => Promise<void>;
}

export interface ITransportClass {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  new (loggerService: LoggerService | Console, apm: Apm): ITransport;
}
