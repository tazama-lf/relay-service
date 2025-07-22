// SPDX-License-Identifier: Apache-2.0
import type { ITransportPlugin } from '@tazama-lf/frms-coe-lib/lib/interfaces/relay-service/ITransportPlugin';
import type { LoggerService } from '@tazama-lf/frms-coe-lib';
import type { Apm } from '@tazama-lf/frms-coe-lib/lib/services/apm';

export const loadTransportPlugin = async (pluginName: string, loggerService: LoggerService, apm: Apm): Promise<ITransportPlugin> => {
  try {
    // Dynamically import the plugin
    loggerService.log(`Loading plugin ${pluginName}`);
    const { default: moduleDefault } = (await import(pluginName)) as { default: { default: new () => ITransportPlugin } };
    const PluginInstance = moduleDefault.default;
    return new PluginInstance();
  } catch (error) {
    loggerService.error(`Failed to load plugin ${pluginName}:`, error);
    throw error;
  }
};
