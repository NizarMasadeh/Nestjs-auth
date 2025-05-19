import {
  ExecutionContext,
  applyDecorators,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class ResponseInterceptor {
  constructor(private contentType: string = 'application/octet-stream') {}

  intercept(context: ExecutionContext, next: any): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: any) => {
        if (!data) {
          throw new Error('No data returned');
        }

        response.setHeader('Content-Type', this.contentType);
        return data;
      }),
    );
  }
}

export function SecureApiResponse(contentType: string = 'application/octet-stream') {
  return applyDecorators(UseInterceptors(new ResponseInterceptor(contentType)));
}
