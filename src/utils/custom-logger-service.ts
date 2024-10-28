// export const logger = {
//     trace: (message: string) => {
//       console.log(`TRACE: ${message}`);
//     },
//     error: (message: string) => {
//       console.error(`ERROR: ${message}`);
//     }
//   };

// Remove this line or replace it with the correct import if available
// import { ILoggerService } from '@frmscoe/frms-coe-startup-lib';
import { ILoggerService } from './logger-service.interface'; // Custom interface

export class CustomLoggerService implements ILoggerService {
  log(message: string): void {
    console.log(`INFO: ${message}`);
  }
  warn(message: string): void {
    console.warn(`WARN: ${message}`);
  }
  error(message: string | Error): void {
    console.error(`ERROR: ${message}`);
  }
}
