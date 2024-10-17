"use strict";
// export const logger = {
//     trace: (message: string) => {
//       console.log(`TRACE: ${message}`);
//     },
//     error: (message: string) => {
//       console.error(`ERROR: ${message}`);
//     }
//   };
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLoggerService = void 0;
class CustomLoggerService {
    log(message) {
        console.log(`INFO: ${message}`);
    }
    warn(message) {
        console.warn(`WARN: ${message}`);
    }
    error(message) {
        console.error(`ERROR: ${message}`);
    }
}
exports.CustomLoggerService = CustomLoggerService;
