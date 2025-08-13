// Developed By Paysys Labs
import { installTransportPlugin } from '../src/utils/installTransportPlugin';
import { execSync } from 'node:child_process';
import { loggerService } from '../src/index';

jest.mock('node:child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('../src/index', () => ({
  loggerService: {
    log: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Transport Plugin Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('installTransportPlugin', () => {
    it('should execute npm install command for the plugin', async () => {
      const pluginName = 'test-plugin';
      installTransportPlugin(pluginName);

      expect(execSync).toHaveBeenCalledWith(`npm install ${pluginName}`, { stdio: 'inherit' });
      expect(loggerService.log).toHaveBeenCalledWith(`Installing plugin ${pluginName}`);
    });

    it('should handle errors during plugin installation', async () => {
      const pluginName = 'failing-plugin';
      const mockError = new Error(`Command failed: npm install ${pluginName}`);
      (execSync as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      installTransportPlugin(pluginName);

      expect(loggerService.error).toHaveBeenCalledWith(
        `Failed to install plugin ${pluginName}:`,
        Error(`Command failed: npm install ${pluginName}`),
        'installTransportPlugin',
      );
    });
  });

  describe('loadTransportPlugin', () => {
    const mockTransportClass = class MockTransport {
      init() {
        return Promise.resolve();
      }
      relay() {
        return Promise.resolve();
      }
    };

    beforeEach(() => {
      jest.resetModules();

      jest.mock('../src/utils/loadTransportPlugin', () => {
        return {
          loadTransportPlugin: jest.fn().mockImplementation(async (pluginName) => {
            loggerService.log(`Loading plugin ${pluginName}`);
            if (pluginName === 'failing-plugin') {
              loggerService.error(`Failed to load plugin ${pluginName}:`, new Error('Import failed'), 'loadTransportPlugin');
              return undefined;
            }
            return mockTransportClass;
          }),
        };
      });
    });

    it('should load transport plugin successfully', async () => {
      const { loadTransportPlugin } = require('../src/utils/loadTransportPlugin');
      const pluginName = 'test-plugin';

      const result = await loadTransportPlugin(pluginName);

      expect(loggerService.log).toHaveBeenCalledWith(`Loading plugin ${pluginName}`);

      expect(result).toBe(mockTransportClass);
    });

    it('should handle errors during plugin loading', async () => {
      const { loadTransportPlugin } = require('../src/utils/loadTransportPlugin');
      const pluginName = 'failing-plugin';

      const result = await loadTransportPlugin(pluginName);

      expect(loggerService.error).toHaveBeenCalledWith(`Failed to load plugin ${pluginName}:`, expect.any(Error), 'loadTransportPlugin');
      expect(result).toBeUndefined();
    });
  });
});
