import { ConsoleLogger, Injectable } from '@nestjs/common';

import { getRequestId } from '../request-context';

@Injectable()
export class AppLogger extends ConsoleLogger {
  private prefix(): string {
    const id = getRequestId();
    return id ? `[req:${id.slice(0, 8)}] ` : '';
  }

  log(message: unknown, ...rest: unknown[]): void {
    super.log(`${this.prefix()}${String(message)}`, ...rest);
  }

  error(message: unknown, ...rest: unknown[]): void {
    super.error(`${this.prefix()}${String(message)}`, ...rest);
  }

  warn(message: unknown, ...rest: unknown[]): void {
    super.warn(`${this.prefix()}${String(message)}`, ...rest);
  }

  debug(message: unknown, ...rest: unknown[]): void {
    super.debug(`${this.prefix()}${String(message)}`, ...rest);
  }

  verbose(message: unknown, ...rest: unknown[]): void {
    super.verbose(`${this.prefix()}${String(message)}`, ...rest);
  }
}
