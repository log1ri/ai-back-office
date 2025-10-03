import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from "../users/schemas/users.schema"; 
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { validateUser } from '../users/dto/validate-user.dto'
import { ConfigService } from '@nestjs/config';
import { LocalPayload, Tokens } from './interfaces/auth.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private usersService: UsersService,
    private readonly configService: ConfigService,
    private jwtService: JwtService
  ) {}

  /**
   * Sign up: Create a new user
   */
  async signUp(createAuthDto: SignupAuthDto) {

    // Check if the user already exists
    const { email, firstname, lastname, position } = createAuthDto;
    const existingUser = await this.userModel.findOne({ email });
    // If user exists, throw an error
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const newUser = new this.userModel({
      email,
      password: createAuthDto.password,
      firstname,
      lastname,
      position,
      createdAt: createAuthDto.createdAt,
      updatedAt: createAuthDto.updatedAt,
      // Guest is default role
    });
    await newUser.save();
    return { message: 'User created successfully', userId: newUser._id };
  }

  /**
   * Sign in: Validate user credentials
   */
  async signIn(user: validateUser): Promise<Tokens> {
    // role from jwt local strategy
    const payload: any = { email: user.email, sub: user._id };
    if (user.role !== undefined && user.role !== null) {
      payload.role = user.role;
    }
    
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      { email: user.email },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }
    );
    return {
      access_token: accessToken,
      refreshToken,
    };
  }

  // refresh access token from refresh token
  async refreshAccessToken(email: string): Promise<{ access_token: string }> {
    try {
      // verify refresh token

      const user = await this.usersService.findByEmail(email);
      if (!user) throw new UnauthorizedException('User not found');
      const payload: any = { email: user.email, sub: user._id, role: user.role };

      const newAccessToken = await this.jwtService.signAsync(
        payload,{
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      });

      return { access_token: newAccessToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // signin check, local payload check
  async validateUser(email: string, password: string): Promise<LocalPayload | null> {
    try {
      // check password
      const user = await this.usersService.findByEmail(email, true);
      if (user && user.password && await bcrypt.compare(password, user.password)) {
          // return all field excpet password
          const plain = typeof user.toObject === 'function' ? user.toObject() : { ...user };
          delete plain.password;

          const result = {
            _id: String(user._id),
            email: plain.email,
            role: plain.role
          };
          return result;
      }
      throw new UnauthorizedException();
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async validateToken(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

}
