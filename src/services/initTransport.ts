import { type LoggerService } from '@tazama-lf/frms-coe-lib';
import { type Configuration } from '../config';
import { installTransportPlugin } from '../utils/installTransportPlugin';
import { loadTransportPlugin } from '../utils/loadTransportPlugin';
import type { ITransportClass, ITransport } from '../interfaces/ITransportPlugin';
import apm from '../apm';

export const initTransport = async (configuration: Configuration, loggerService: LoggerService | Console): Promise<ITransport> => {
  loggerService.log('Initializing transport plugin', 'initTransport');

  try {
    loggerService.log(`Installing and loading transport plugin ${configuration.DESTINATION_TRANSPORT_TYPE}`, 'initTransport');
    await installTransportPlugin(configuration.DESTINATION_TRANSPORT_TYPE);

    const TransportPlugin: ITransportClass = await loadTransportPlugin(configuration.DESTINATION_TRANSPORT_TYPE);
    if (!TransportPlugin) {
      throw new Error('Transport plugin is undefined');
    }

    const transport = new TransportPlugin(loggerService, apm);

    if (typeof transport.init !== 'function') {
      loggerService.error('Invalid transport plugin: missing init method', 'initTransport');
      throw new Error('Invalid transport plugin structure');
    }

    await transport.init();
    return transport;
  } catch (error) {
    loggerService.error(`Failed to initialize transport plugin: ${JSON.stringify(error)}`, 'initTransport');
    throw error as Error; // Re-throw to ensure function doesn't return undefined
  }
};
