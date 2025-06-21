import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserId = createParamDecorator(
  (_data, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    return request.user?.id;
  },
);

export const GetUser = createParamDecorator(
  (_data, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
