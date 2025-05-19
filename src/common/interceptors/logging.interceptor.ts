import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;

    const correlationId = headers['x-correlation-id'] || uuidv4();
    request.correlationId = correlationId;

    const userAgent = headers['user-agent'] || 'unknown';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          this.logger.log({
            message: `${method} ${url} completed`,
            correlationId,
            method,
            url,
            userAgent,
            responseTime: `${responseTime}ms`,
            statusCode: context.switchToHttp().getResponse().statusCode,
            requestBody: this.sanitizeData(body),
            responseSize: this.calculateSize(data),
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error({
            message: `${method} ${url} failed`,
            correlationId,
            method,
            url,
            userAgent,
            responseTime: `${responseTime}ms`,
            statusCode: error.status || 500,
            errorName: error.name,
            errorMessage: error.message,
            stackTrace: error.stack,
          });
        },
      }),
    );
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    const sanitized = { ...data };

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'credit_card',
      'ssn',
    ];
    for (const field of sensitiveFields) {
      if (sanitized[field]) sanitized[field] = '***REDACTED***';
    }

    return sanitized;
  }

  private calculateSize(data: any): string {
    if (!data) return '0B';
    const size = Buffer.from(JSON.stringify(data)).length;

    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)}KB`;
    return `${(size / (1024 * 1024)).toFixed(2)}MB`;
  }
}
