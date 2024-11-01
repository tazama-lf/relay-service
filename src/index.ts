// Developed By Paysys Labs

import { MessageRelayService } from './services/message-relay-service';

async function startRelayServices(): Promise<void> {
  const relayService = new MessageRelayService();
  await relayService.start();
}

startRelayServices();
