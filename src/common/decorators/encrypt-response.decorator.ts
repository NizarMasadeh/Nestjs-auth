import { applyDecorators, UseInterceptors, SetMetadata } from '@nestjs/common';
import { EncryptInterceptor } from '../interceptors/encrypt.interceptor';

export const ENCRYPT_RESPONSE = 'ENCRYPT_RESPONSE';

export function EncryptResponse() {
  return applyDecorators(
    SetMetadata(ENCRYPT_RESPONSE, true),
    UseInterceptors(EncryptInterceptor)
  );
}
