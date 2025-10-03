import { Controller, Get, Post, Body, UseGuards, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { SigninAuthDto } from './dto/signin-auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { validateUser } from '../users/dto/validate-user.dto'
import { ConfigService } from '@nestjs/config';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  @Post('/sign-up')
  signUp(@Body() createAuthDto: SignupAuthDto) {
    return this.authService.signUp(createAuthDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  async signIn(@Request() req , @Res({ passthrough: true }) res: Response) {
    // return this.authService.signIn(req.user);
    const { access_token, refreshToken } = await this.authService.signIn(req.user as validateUser);
    
    return { message: 'Sign in successful', access_token, refreshToken };
  }
  @UseGuards(JwtRefreshAuthGuard)
  @Post('/refresh-token')
  async refreshToken(@Request() req) {
    const newAccessToken = await this.authService.refreshAccessToken(req.user.email);
    return { message: 'Refresh token successful', accessToken: newAccessToken.access_token };
  }

}
