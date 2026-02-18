import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : {};
    const res =
      typeof exceptionResponse === 'object'
        ? exceptionResponse
        : { message: String(exceptionResponse) };
    const message =
      (res as { message?: string | string[] })?.message ??
      (exception instanceof Error
        ? exception.message
        : 'Internal server error');
    const errorCode = (res as { errorCode?: string })?.errorCode;

    const finalMessage = Array.isArray(message) ? message[0] : message;

    const body = {
      success: false,
      message: finalMessage,
      ...(errorCode && { errorCode }),
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${finalMessage}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json(body);
  }
}
