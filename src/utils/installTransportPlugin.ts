// SPDX-License-Identifier: Apache-2.0
import { execSync } from 'node:child_process';
import { loggerService } from '..';

export const installTransportPlugin = (pluginName: string): void => {
  try {
    loggerService.log(`Installing plugin ${pluginName}`);
    execSync(`npm install ${pluginName}`, { stdio: 'inherit' });
  } catch (error) {
    loggerService.error(`Failed to install plugin ${pluginName}:`, error, 'installTransportPlugin');
  }
};
