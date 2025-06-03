// SPDX-License-Identifier: Apache-2.0
import { Apm } from '@tazama-lf/frms-coe-lib/lib/services/apm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const apm = new Apm({
  usePathAsTransactionName: true,
  transactionIgnoreUrls: ['/health'],
});

export default apm;
