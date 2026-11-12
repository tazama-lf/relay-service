import { initTransport } from '../src/services/initTransport';
import { installTransportPlugin } from '../src/utils/installTransportPlugin';
import { loadTransportPlugin } from '../src/utils/loadTransportPlugin';
import type { Configuration } from '../src/config';
import type { LoggerService } from '@tazama-lf/frms-coe-lib';
import apm from '../src/apm';

jest.mock('../src/utils/installTransportPlugin');
jest.mock('../src/utils/loadTransportPlugin');
jest.mock('../src/apm', () => ({}));
jest.mock('../src', () => ({ loggerService: { log: jest.fn(), error: jest.fn() } }));

describe('initTransport', () => {
  it.each([
    ['@tazama-lf/nats-relay-plugin@4.1.0-rc.0', '@tazama-lf/nats-relay-plugin'],
    ['@tazama-lf/nats-relay-plugin', '@tazama-lf/nats-relay-plugin'],
    ['test-plugin@1.2.3', 'test-plugin'],
    ['test-plugin', 'test-plugin'],
  ])('installs %s and imports %s', async (pluginSpec, pluginName) => {
    jest.clearAllMocks();
    const logger = { log: jest.fn(), error: jest.fn() } as unknown as LoggerService;
    const transport = { init: jest.fn().mockResolvedValue(undefined), relay: jest.fn() };
    jest.mocked(loadTransportPlugin).mockResolvedValue(transport);

    const result = await initTransport({ DESTINATION_TRANSPORT_TYPE: pluginSpec } as Configuration, logger);

    expect(installTransportPlugin).toHaveBeenCalledWith(pluginSpec);
    expect(loadTransportPlugin).toHaveBeenCalledWith(pluginName, logger, apm);
    expect(transport.init).toHaveBeenCalledWith(logger, apm);
    expect(result).toBe(transport);
  });
});
