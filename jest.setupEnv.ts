// SPDX-License-Identifier: Apache-2.0
process.env.MAX_CPU = '1';
process.env.STARTUP_TYPE = 'nats';
process.env.SERVER_URL = 'nats';
process.env.FUNCTION_NAME = 'relay';
process.env.PRODUCER_STREAM = 'stream';
process.env.CONSUMER_STREAM = 'stream';
process.env.DESTINATION_TYPE = 'nats';
process.env.DESTINATION_URL = 'nats';

process.env.APM_ACTIVE = 'false';
process.env.APM_SERVICE_NAME = '';
process.env.APM_URL = '';
