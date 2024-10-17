"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nats_1 = require("nats");
const config_1 = require("../config");
function publishMessages(numberOfMessages) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const nc = yield (0, nats_1.connect)({ servers: config_1.config.serverUrl });
            for (let i = 0; i < numberOfMessages; i++) {
                const message = `Test message ${i + 1}`;
                nc.publish(config_1.config.consumerStream, Buffer.from(message));
                console.log(`Message ${i + 1} published to ${config_1.config.consumerStream}`);
            }
            yield nc.drain();
        }
        catch (err) {
            console.error('Failed to publish messages:', err);
        }
    });
}
// Specify the number of messages you want to publish
const numberOfMessages = 10;
publishMessages(numberOfMessages);
