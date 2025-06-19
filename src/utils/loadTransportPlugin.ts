// SPDX-License-Identifier: Apache-2.0
import { loggerService } from '..';
import { ITransportClass } from '../interfaces/ITransportPlugin';

export const loadTransportPlugin = async (pluginName: string): Promise<ITransportClass> => {
  try {
    // Dynamically import the plugin
    loggerService.log(`Loading plugin ${pluginName}`);
    const { default: plugin } = await import(`${pluginName}`);
    return plugin.default as ITransportClass;
  } catch (error) {
    loggerService.error(`Failed to load plugin ${pluginName}:`, error);
    throw error;
  }
};
