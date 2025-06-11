// SPDX-License-Identifier: Apache-2.0
// Developed By Paysys Labs
import type { AdditionalConfig, ProcessorConfig } from '@tazama-lf/frms-coe-lib/lib/config/processor.config';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

export interface ExtendedConfig {
  SERVER_URL: string;
  CONSUMER_STREAM: string;
  DESTINATION_TRANSPORT_TYPE: string;
  JSON_PAYLOAD: string;
}

export const additionalEnvironmentVariables: AdditionalConfig[] = [
  {
    name: 'SERVER_URL',
    type: 'string',
  },
  {
    name: 'CONSUMER_STREAM',
    type: 'string',
  },
  {
    name: 'DESTINATION_TRANSPORT_TYPE',
    type: 'string',
  },
  {
    name: 'JSON_PAYLOAD',
    type: 'string',
  },
];

export type Configuration = ProcessorConfig & ExtendedConfig;
