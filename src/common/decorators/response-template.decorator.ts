import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

export function ResponseTemplate() {
  return applyDecorators(
    UseInterceptors(TransformInterceptor),
  );
}
