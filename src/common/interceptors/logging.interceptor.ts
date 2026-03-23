import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

interface RequestWithUser extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();

    // 3. Injetamos as tipagens do Express aqui
    const request = ctx.getRequest<RequestWithUser>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl, body, ip } = request;
    const userAgent = request.headers['user-agent'] || '';
    const startTime = Date.now();

    // Log do Incoming
    this.logger.log(
      `[INCOMING] ${method} ${originalUrl} - IP: ${ip} - User: ${
        request.user?.uid || 'Anonymous'
      }`,
    );

    // Validação segura e tipada para checar se o body tem chaves
    if (body && typeof body === 'object' && Object.keys(body).length > 0) {
      this.logger.debug(`[PAYLOAD] ${JSON.stringify(this.sanitize(body))}`);
    }

    // 4. Tipamos o retorno do tap como 'unknown'
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.logger.log(
          `[OUTGOING] ${method} ${originalUrl} ${statusCode} - ${duration}ms - UserAgent: ${userAgent}`,
        );
      }),
    );
  }

  private sanitize(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    const sanitized: Record<string, unknown> = {
      ...(obj as Record<string, unknown>),
    };

    const sensitiveKeys = [
      'password',
      'token',
      'email',
      'birth',
      'phone',
      'fcmtoken',
      'cpf',
      'taxid',
    ];

    for (const [key, value] of Object.entries(sanitized)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      }
    }

    return sanitized;
  }
}
