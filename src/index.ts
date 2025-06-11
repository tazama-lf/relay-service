// Developed By Paysys Labs
import './apm';
import { additionalEnvironmentVariables, type Configuration } from './config';
import { validateProcessorConfig } from '@tazama-lf/frms-coe-lib/lib/config/processor.config';
import { initTransport } from './services/initTransport';
import type { ITransport } from './interfaces/ITransportPlugin';
import { execute } from './services/execute';
import { StartupFactory } from '@tazama-lf/frms-coe-startup-lib';
import { LoggerService } from '@tazama-lf/frms-coe-lib';

export const configuration = validateProcessorConfig(additionalEnvironmentVariables) as Configuration;
export const loggerService: LoggerService = new LoggerService(configuration);
export let transport: ITransport;

async function startRelayServices(): Promise<void> {
  const relayService = new StartupFactory();
  loggerService.log(`${configuration.DESTINATION_TRANSPORT_TYPE}`, 'index');
  transport = await initTransport(configuration, loggerService);

  if (configuration.nodeEnv !== 'test') {
    let isConnected = false;
    for (let retryCount = 0; retryCount < 10; retryCount++) {
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
}
startRelayServices();
