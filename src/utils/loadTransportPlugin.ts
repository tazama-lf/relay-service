// SPDX-License-Identifier: Apache-2.0
import { ITransportPlugin } from '@tazama-lf/frms-coe-lib/lib/interfaces/relay-service/ITransportPlugin';
import { LoggerService } from '@tazama-lf/frms-coe-lib';
import { Apm } from '@tazama-lf/frms-coe-lib/lib/services/apm';

export const loadTransportPlugin = async (pluginName: string, loggerService: LoggerService, apm: Apm): Promise<ITransportPlugin> => {
  try {
    // Dynamically import the plugin
    loggerService.log(`Loading plugin ${pluginName}`);
    const { default: moduleDefault } = await import(pluginName);
    const PluginInstance = moduleDefault.default;
    return new PluginInstance();
  } catch (error) {
    loggerService.error(`Failed to load plugin ${pluginName}:`, error);
    throw error;
  }
};
