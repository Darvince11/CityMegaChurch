import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { DomainError, ValidationError, ZodError } from '@cdp/shared';

interface ErrorBody {
  code: string;
  message: string;
  details?: { field: string; message: string }[];
}

/**
 * Centralized exception filter — all HTTP responses flow through here
 * (docs/DEVELOPMENT.md §Error handling). Never enclose services in
 * try/catch to build manual HTTP responses.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const body = this.toErrorBody(exception);
    void reply.status(body.status).send({ error: body.payload });
  }

  private toErrorBody(exception: unknown): { status: number; payload: ErrorBody } {
    if (exception instanceof ValidationError) {
      return {
        status: exception.status,
        payload: { code: exception.code, message: exception.message, details: exception.details },
      };
    }
    if (exception instanceof ZodError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        payload: {
          code: 'VALIDATION_FAILED',
          message: 'Request validation failed.',
          details: exception.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
      };
    }
    if (exception instanceof DomainError) {
      return {
        status: exception.status,
        payload: { code: exception.code, message: exception.message },
      };
    }
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const status = exception.getStatus();
      const message =
        typeof response === 'string'
          ? response
          : (response as { message?: string | string[] }).message ?? exception.message;
      return {
        status,
        payload: {
          code: `HTTP_${status}`,
          message: Array.isArray(message) ? message.join('; ') : message,
        },
      };
    }

    this.logger.error(
      'Unhandled exception',
      exception instanceof Error ? exception.stack : String(exception),
    );
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      payload: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
    };
  }
}
