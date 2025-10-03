import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class SigninAuthDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;
 
  @IsNotEmpty()
  @IsString({ message: 'Password must be a string.' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  @Matches(/\d/, { message: 'Password must contain at least one number.' })
  @MinLength(6, { message: 'Password must be at least 6 characters.' })
  
  password: string;
}
