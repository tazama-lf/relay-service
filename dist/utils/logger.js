"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    trace: (message) => {
        console.log(`TRACE: ${message}`);
    },
    error: (message) => {
        console.error(`ERROR: ${message}`);
    }
};
