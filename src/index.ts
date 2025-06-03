// Developed By Paysys Labs
import './apm';
import { StartupFactory } from '@tazama-lf/frms-coe-startup-lib';
import { additionalEnvironmentVariables, type Configuration } from './config';
import { validateProcessorConfig } from '@tazama-lf/frms-coe-lib/lib/config/processor.config';
import { NatsRelay } from '@tazama-lf/frms-coe-startup-lib/lib/services/natsRelayService';
import { RestRelay } from '@tazama-lf/frms-coe-startup-lib/lib/services/restRelayService';
import { GoogleRelay } from '@tazama-lf/frms-coe-startup-lib/lib/services/googleBucketsService';
import { RabbitRelay } from '@tazama-lf/frms-coe-startup-lib/lib/services/rabbitMQRelayService';
import { BigQueryRelay } from '@tazama-lf/frms-coe-startup-lib/lib/services/bigQueryRelayService';
import { type IRelay } from '@tazama-lf/frms-coe-startup-lib/lib/interfaces/iRelayService';
import { execute } from './services/execute';
import { LoggerService } from '@tazama-lf/frms-coe-lib';

export const configuration = validateProcessorConfig(additionalEnvironmentVariables) as Configuration;
export const loggerService: LoggerService = new LoggerService(configuration);

export let relay: IRelay;

async function startRelayServices(): Promise<void> {
  const relayService = new StartupFactory();

  /* eslint-disable no-case-declarations -- create separate instances */
  switch (configuration.DESTINATION_TYPE) {
    case 'nats':
      const nats = new NatsRelay();
      await nats.init();
      relay = nats;
      break;
    case 'rest':
      const rest = new RestRelay();
      await rest.init();
      relay = rest;
      break;
    case 'rabbitmq':
      const rabbit = new RabbitRelay();
      await rabbit.init({ functionName: configuration.functionName, maxCPU: configuration.maxCPU, nodeEnv: configuration.nodeEnv });
      relay = rabbit;
      break;
    case 'google':
      const google = new GoogleRelay();
      await google.init();
      relay = google;
      break;
    case 'bigQuery':
      const bigQuery = new BigQueryRelay();
      await bigQuery.init();
      relay = bigQuery;
      break;
    default:
      loggerService.warn('No Destination type specified.');
      break;
  }

  /* eslint-enable no-case-declarations -- reenable */
  if (configuration.nodeEnv !== 'test') {
    let isConnected = false;
    for (let retryCount = 0; retryCount < 10; retryCount++) {
      loggerService.log('Connecting to nats server...');
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
