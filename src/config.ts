// Developed By Paysys Labs
import type { AdditionalConfig, ProcessorConfig } from '@tazama-lf/frms-coe-lib/lib/config/processor.config';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

export interface ExtendedConfig {
  DESTINATION_URL: string;
  DESTINATION_TYPE: string;
}

export const additionalEnvironmentVariables: AdditionalConfig[] = [
  {
    name: 'DESTINATION_TYPE',
    type: 'string',
  },
  {
    name: 'DESTINATION_URL',
    type: 'string',
  },
];

export type Configuration = ProcessorConfig & ExtendedConfig;
