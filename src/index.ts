// SPDX-License-Identifier: Apache-2.0
// Developed By Paysys Labs
import './apm';
import { additionalEnvironmentVariables, type Configuration } from './config';
import { validateProcessorConfig } from '@tazama-lf/frms-coe-lib/lib/config/processor.config';
import { initTransport } from './services/initTransport';
import type { ITransportPlugin } from '@tazama-lf/frms-coe-lib/lib/interfaces/relay-service/ITransportPlugin';
import { execute } from './services/execute';
import { StartupFactory } from '@tazama-lf/frms-coe-startup-lib';
import { LoggerService } from '@tazama-lf/frms-coe-lib';

export const configuration = validateProcessorConfig(additionalEnvironmentVariables) as Configuration;
export const loggerService: LoggerService = new LoggerService(configuration);
export let transport: ITransportPlugin;

async function startRelayServices(): Promise<void> {
  try {
    const relayService = new StartupFactory();
    loggerService.log(`${configuration.DESTINATION_TRANSPORT_TYPE}`, 'index');
    transport = await initTransport(configuration, loggerService);

    if (configuration.nodeEnv !== 'test') {
      let isConnected = false;
      for (let retryCount = 0; retryCount < 10; retryCount++) {
        loggerService.log('Connecting to nats server...', 'startRelayServices');
        if (!(await relayService.init(execute, loggerService))) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          loggerService.log('Connected to nats');
          isConnected = true;
          break;
        }
      }

      if (!isConnected) {
        throw new Error('Unable to connect to nats after 10 retries');
      }
    }
  } catch (error) {
    loggerService.error('Failed to start relay service', error as Error, 'index');
  }
}
startRelayServices();
