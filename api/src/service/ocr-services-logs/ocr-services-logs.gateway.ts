import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OcrServicesLogsService } from './ocr-services-logs.service';
import {FilterRealtimeLogsDto} from './dto/filter-realtime-ocr-services-log.dto';
import { OnModuleInit, UseGuards, UseFilters } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {OcrServiceLog} from './schemas/ocr-services-logs.schema'
import { WsJwtGuard } from '../auth/guards/ws-jwt-auth.guard';
import { WsRolesGuard } from '../auth/guards/ws-role-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { SocketIoExceptionFilter } from './socket-io-exception.filter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@UseFilters(SocketIoExceptionFilter)
@UseGuards(WsJwtGuard, WsRolesGuard)
@WebSocketGateway(
  {  
    namespace: '/ocr-logs', 
    cors: { origin: '*' },
    transports: ['websocket', 'polling'],
  })
export class OcrServicesLogsGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  
  constructor(
     @InjectModel(OcrServiceLog.name) private logModel: Model<OcrServiceLog>,
      private ocrServicesLogsService: OcrServicesLogsService,
      private jwtService: JwtService,
      private configService: ConfigService, 
  ) {}
  
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    
    // Middleware to authenticate WebSocket connections using JWT
    server.use((socket: Socket, next) => {
      let token: string | undefined;

      // Check for token in query or headers
      if (socket.handshake.query?.token) {
        token = Array.isArray(socket.handshake.query.token)
          ? socket.handshake.query.token[0]
          : socket.handshake.query.token as string;
      } 
      else if (socket.handshake.headers?.authorization) {
        const authHeader = String(socket.handshake.headers.authorization);
        token = authHeader.startsWith('Bearer ')
          ? authHeader.replace('Bearer ', '')
          : authHeader;
      }

      if (!token) {
        return next(new Error('Unauthorized: No JWT provided'));
      }

      try {
        // Verify the token using the JwtService
        const jwtSecret = this.configService.get<string>('JWT_SECRET');
        const payload = this.jwtService.verify(token, { secret: jwtSecret }); 
        // Attach user information to the socket
        (socket as any).user = payload;
        // Proceed to the next middleware
        next();
      } catch (err) {
        return next(new Error('Unauthorized: Invalid JWT'));
      }
    });
  }


  // Listen for changes on the collection
  onModuleInit() {
    const changeStream = this.logModel.watch();
    changeStream.on('change', (change) => {
      if (change.operationType === 'insert') {
         this.server.emit('new-realtime-log', change.fullDocument);
      }
    });
  }

  @Roles(Role.Admin, Role.Supervisor, Role.Manager)
  @SubscribeMessage('get-realtime-logs')
  async handleGetLogsRealtime(
    @ConnectedSocket() client: Socket,
    @MessageBody() filter: FilterRealtimeLogsDto 
  ) {
    try{
      // Check if the user is authenticated
      const user = (client as any).user;
      
      // If user is not authenticated, emit an error
      if (!user) {
        client.emit('logs-error', { message: 'Unauthorized', status: 401 });
        return;
      }
      // Validate the filter
      const logs = await this.ocrServicesLogsService.findLogsForRealTime(filter);
      client.emit('realtime-log', logs); 
    }
    catch (error) {
      client.emit('logs-error', { message: error.message, status: error.status || 500 });
    }
  }

  // Handle ping for keepalive
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong');
  }

  // Handle client connection
  async handleConnection(client: Socket) {
    try {
      
      const token = client.handshake.auth?.token || 
                   client.handshake.query?.token ||
                   client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.emit('logs-error', { 
          message: 'Authentication required', 
          code: 401 
        });
        client.disconnect(true);
        return;
      }

      // console.log(`Client ${client.id} authenticated successfully`);
    } catch (error) {
      // console.error(`Authentication error for client ${client.id}:`, error);
      client.emit('logs-error', { 
        message: 'Authentication failed', 
        code: 401 
      });
      client.disconnect(true);
    }
  }

  // Handle client disconnection
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

}
