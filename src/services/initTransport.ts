// SPDX-License-Identifier: Apache-2.0
import { type LoggerService } from '@tazama-lf/frms-coe-lib';
import { type Configuration } from '../config';
import { installTransportPlugin } from '../utils/installTransportPlugin';
import { loadTransportPlugin } from '../utils/loadTransportPlugin';
import type { ITransportPlugin } from '@tazama-lf/frms-coe-lib/lib/interfaces/relay-service/ITransportPlugin';
import apm from '../apm';

export const initTransport = async (configuration: Configuration, loggerService: LoggerService): Promise<ITransportPlugin> => {
  loggerService.log('Initializing transport plugin', 'initTransport');

  try {
    loggerService.log(`Installing and loading transport plugin ${configuration.DESTINATION_TRANSPORT_TYPE}`, 'initTransport');
    await installTransportPlugin(configuration.DESTINATION_TRANSPORT_TYPE);

    const transport = await loadTransportPlugin(configuration.DESTINATION_TRANSPORT_TYPE, loggerService, apm);
    if (!transport) {
      throw new Error('Transport plugin is undefined');
    }

    await transport.init();
    return transport;
  } catch (error) {
    loggerService.error(`Failed to initialize transport plugin: ${JSON.stringify(error)}`, 'initTransport');
    throw error as Error;
  }
};
