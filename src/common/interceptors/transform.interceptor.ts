import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: Record<string, any>;
  links?: Record<string, string>;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        if (data && data.items && data.meta) {
          const { items, meta } = data;
          const links = this.generatePaginationLinks(request, meta);

          return {
            meta,
            links,
            data: items,
          };
        }

        return {
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            correlationId: request.correlationId,
          },
          data,
        };
      }),
    );
  }

  private generatePaginationLinks(
    request: any,
    meta: any,
  ): Record<string, string> {
    const { path, query } = request;
    const { currentPage, totalPages } = meta;
    const baseUrl = `${request.protocol}://${request.get('host')}${path}`;

    /*******Becuase the currentPage is behaving as a string, 1 + 2 = 12*******/
    const currentPageInt = parseInt(currentPage);

    const links: Record<string, string> = {};

    links.self = `${baseUrl}?page=${currentPageInt}&limit=${query.limit || 10}`;

    links.first = `${baseUrl}?page=1&limit=${query.limit || 10}`;

    links.last = `${baseUrl}?page=${totalPages}&limit=${query.limit || 10}`;

    if (currentPageInt < totalPages) {
      links.next = `${baseUrl}?page=${currentPageInt + 1}&limit=${query.limit || 10}`;
    }

    if (currentPageInt > 1) {
      links.prev = `${baseUrl}?page=${currentPageInt - 1}&limit=${query.limit || 10}`;
    }

    return links;
  }
}
