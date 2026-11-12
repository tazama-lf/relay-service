// SPDX-License-Identifier: Apache-2.0
import type { LoggerService } from '@tazama-lf/frms-coe-lib';
import type { Configuration } from '../config';
import { installTransportPlugin } from '../utils/installTransportPlugin';
import { loadTransportPlugin } from '../utils/loadTransportPlugin';
import type { ITransportPlugin } from '@tazama-lf/frms-coe-lib/lib/interfaces/relay-service/ITransportPlugin';
import apm from '../apm';
import * as util from 'node:util';

export const initTransport = async (configuration: Configuration, loggerService: LoggerService): Promise<ITransportPlugin> => {
  loggerService.log('Initializing transport plugin', 'initTransport');

  try {
    loggerService.log(`Installing and loading transport plugin ${configuration.DESTINATION_TRANSPORT_TYPE}`, 'initTransport');
    installTransportPlugin(configuration.DESTINATION_TRANSPORT_TYPE);

    // for when a specific version is specified in the transport's package name
    const pluginSpec = configuration.DESTINATION_TRANSPORT_TYPE;
    const versionSeparator = pluginSpec.lastIndexOf('@');
    const pluginName = versionSeparator > 0 ? pluginSpec.slice(0, versionSeparator) : pluginSpec;
    const transport: ITransportPlugin = await loadTransportPlugin(pluginName, loggerService, apm);

    await transport.init(loggerService, apm);
    return transport;
  } catch (error) {
    loggerService.error(`Failed to initialize transport plugin: ${util.inspect(error)}`, 'initTransport');
    throw error as Error;
  }
};
