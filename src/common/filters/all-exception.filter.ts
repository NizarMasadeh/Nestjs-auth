import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('Exception');

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : 500;

        const errorResponse =
            exception instanceof HttpException
                ? (exception.getResponse() as any)
                : {
                    message: exception.message || 'Internal server error',
                    error: exception.name,
                };

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

        response.status(status).json({
            statusCode: status,
            message: errorResponse.message,
            details: errorResponse.details || null,
        });
    }
}
