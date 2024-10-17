// Developed By Paysys Labs

import { MessageRelayService } from "./services/message-relay-service";

async function startRelayServices() {
  const relayService = new MessageRelayService();
  console.log();
  await relayService.start();
}

startRelayServices().catch((err) => {
  console.error("Failed to start relay services:", err);
});
