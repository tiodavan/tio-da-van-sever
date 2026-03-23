import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[] | object;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawMessage =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      rawMessage === null
        ? 'Internal server error'
        : typeof rawMessage === 'string'
          ? rawMessage
          : (rawMessage as Record<string, unknown>).message ?? rawMessage;

    const errorBody: ErrorBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message as string,
    };

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status} Internal Server Error`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} → ${status}: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorBody);
  }
}
