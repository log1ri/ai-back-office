import { ExtractJwt,Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import {ConfigService} from '@nestjs/config'
import { AuthService } from '../auth.service'
import  { JwtValidatedUser, JwtPayload } from '../interfaces/auth.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService
  ) {

    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined!');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, 
    });
  }

  async validate(payload: JwtPayload): Promise<JwtValidatedUser> {
    const user = await this.authService.validateToken(payload.email);
    return { 
      userId: user._id ? String(user._id) : undefined,
      email: user.email,
      role: user.role
    };

  }
}
