import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ENCRYPT_RESPONSE } from '../decorators/encrypt-response.decorator';
import { CryptoService } from '../services/crypto.service';

@Injectable()
export class EncryptInterceptor implements NestInterceptor {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isEncrypted = this.reflector.get<boolean>(
      ENCRYPT_RESPONSE,
      context.getHandler(),
    );

    if (!isEncrypted) return next.handle();

    return next
      .handle()
      .pipe(map((data) => JSON.stringify(this.cryptoService.encrypt(data))));
  }
}
