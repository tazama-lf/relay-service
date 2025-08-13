// SPDX-License-Identifier: Apache-2.0
// Developed By Paysys Labs
import type { AdditionalConfig, ProcessorConfig } from '@tazama-lf/frms-coe-lib/lib/config/processor.config';
import * as dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

export interface ExtendedConfig {
  DESTINATION_TRANSPORT_TYPE: string;
  OUTPUT_TO_JSON: boolean;
}

export const additionalEnvironmentVariables: AdditionalConfig[] = [
  {
    name: 'DESTINATION_TRANSPORT_TYPE',
    type: 'string',
  },
  {
    name: 'OUTPUT_TO_JSON',
    type: 'boolean',
  },
];

export type Configuration = ProcessorConfig & ExtendedConfig;
