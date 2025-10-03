import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService} from "../auth.service";
import  { JwtValidatedUser, JwtPayload } from '../interfaces/auth.interface'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor( configService: ConfigService, private readonly authService: AuthService) {

    const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: refreshSecret,
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