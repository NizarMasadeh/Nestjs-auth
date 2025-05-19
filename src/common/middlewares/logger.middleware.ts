import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction): void {
        const requestId = uuidv4();
        const { method, originalUrl } = req;
        const userAgent = req.get('user-agent') || '';
        const ip = req.ip;

        const startTime = Date.now();
        let isResponseFinished = false;

        (req as any).requestId = requestId;

        const originalJson = res.json;
        let responseBody: any;

        res.json = function (body: any) {
            responseBody = body;
            return originalJson.call(this, body);
        };

        res.on('finish', () => {
            isResponseFinished = true;
            const { statusCode } = res;
            const contentLength = res.get('content-length');
            const duration = Date.now() - startTime;

            const message = `${method} ${originalUrl} ${statusCode} - ${contentLength || 0} bytes - ${duration}ms`;

            if (statusCode >= 400) {
                this.logger.error(
                    `[${requestId}] ${ip} ${userAgent} | ${message}\nResponse: ${JSON.stringify(responseBody)}`,
                    'HTTP Error'
                );
            } else {
                this.logger.log(`[${requestId}] ${ip} ${userAgent} | ${message}`);
            }
        });

        res.on('close', () => {
            if (!isResponseFinished) {
                const duration = Date.now() - startTime;
                this.logger.warn(`[${requestId}] Connection closed after ${duration}ms without completing request`);
            }
        });

        next();
    }
}
