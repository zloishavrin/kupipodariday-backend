import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody =
      exception instanceof HttpException
        ? {
            message: exception.message,
            status: exception.getStatus(),
          }
        : {
            message:
              'Ошибка сервера. Пожалуйста, повторите попытку позже или свяжитесь с нами',
            status: HttpStatus.INTERNAL_SERVER_ERROR,
          };

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
