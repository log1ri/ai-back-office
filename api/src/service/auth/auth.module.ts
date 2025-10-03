import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from '../users/schemas/users.schema';
import { RolesGuard } from './guards/roles.guard';
import { WsJwtGuard } from './guards/ws-jwt-auth.guard';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule, PassportModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined!');
        }
        return {
          secret,
          signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
        };
      },
      inject: [ConfigService],
    }),
    forwardRef(() => UsersModule),
    
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy, RolesGuard, WsJwtGuard, JwtAuthGuard],
  exports: [AuthService, JwtModule, WsJwtGuard, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), JwtAuthGuard, RolesGuard],
})
export class AuthModule {}

