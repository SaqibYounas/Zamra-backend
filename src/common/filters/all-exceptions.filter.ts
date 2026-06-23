import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An internal server error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      message =
        typeof res === 'object' && 'message' in res
          ? Array.isArray((res as any).message)
            ? (res as any).message[0]
            : (res as any).message
          : exception.message;
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message =
        'Database operation failed. Please check your input parameters.';
      if ((exception as any).code === '23505') {
        message = 'This record already exists in the system.';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    console.error(`============= 🚨 [GLOBAL ERROR LOG] =============`);
    console.error(`Timestamp : ${new Date().toISOString()}`);
    console.error(`Method    : ${request.method}`);
    console.error(`URL       : ${request.url}`);
    console.error(`Message   : ${message}`);
    console.error(
      `Stack     :`,
      exception instanceof Error ? exception.stack : exception,
    );
    console.error(`=================================================`);
    response.status(status).json({
      success: false,
      status: status,
      message: message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
