// SPDX-License-Identifier: Apache-2.0
import { loggerService } from '..';

export const loadTransportPlugin = async (pluginName: string) => {
  try {
    // Dynamically import the plugin
    loggerService.log(`Loading plugin ${pluginName}`);
    const { default: plugin } = await import(`${pluginName}`);
    return plugin.default;
  } catch (error) {
    loggerService.error(`Failed to load plugin ${pluginName}:`, error);
    throw error;
  }
};
