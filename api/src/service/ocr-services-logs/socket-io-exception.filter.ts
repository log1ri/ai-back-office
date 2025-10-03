import {
  Catch,
  ArgumentsHost,
  WsExceptionFilter,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch()
export class SocketIoExceptionFilter implements WsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client: Socket = ctx.getClient<Socket>();

    let message = 'Something went wrong';

    if (exception instanceof UnauthorizedException || exception instanceof ForbiddenException || exception instanceof HttpException) {
      const response = exception.getResponse();
      message = typeof response === 'string' ? response : response['message'];
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    client.emit('logs-error', {
      message,
    });
  }
}
