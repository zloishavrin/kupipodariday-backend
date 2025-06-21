import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class PasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map((data) => this.removePasswordField(data)));
  }

  private removePasswordField(data: any) {
    if (Array.isArray(data)) {
      return data.map((item) => this.removePasswordField(item));
    } else if (data && typeof data === 'object') {
      const newObj = { ...data };
      for (const key in newObj) {
        if (key === 'password') {
          delete newObj[key];
        } else if (typeof newObj[key] === 'object' && newObj[key] !== null) {
          newObj[key] = this.removePasswordField(newObj[key]);
        }
      }
      return newObj;
    }
    return data;
  }
}
