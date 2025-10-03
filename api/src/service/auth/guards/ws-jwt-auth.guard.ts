import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {

    // Get the client socket from the context
    const client: Socket = context.switchToWs().getClient<Socket>();
    
    // Extract the token from the query or headers
    let token = client.handshake?.query?.token || client.handshake?.headers?.authorization?.replace('Bearer ', '');
    
    // Ensure token is a string
    if (Array.isArray(token)) {
      token = token[0];
    }

    // Check if token is provided
    if (!token) throw new UnauthorizedException();
    
    try {
      
      // Verify the token using the JwtService
      const payload = this.jwtService.verify(token, { secret: this.configService.get<string>('JWT_SECRET') });
      (client as any).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
