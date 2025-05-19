import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = exception.getResponse() as any;
    const errorDetails = {
      requestId: (request as any).requestId,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      ip: request.ip,
      userAgent: request.get('user-agent'),
      error: errorResponse.error || errorResponse.message,
      details: errorResponse.details,
      stack: process.env.NODE_ENV === 'development' ? exception.stack : undefined,
    };

    this.logger.error(errorDetails, `${request.method} ${request.url} failed`);

    response
      .status(status)
      .json({
        statusCode: status,
        message: errorResponse.message,
        details: errorResponse.details,
      });
  }
}