import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, Matches  } from 'class-validator';
export class SignupAuthDto {
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    @IsNotEmpty()
    email: string;
    
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters.' })
    @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    @Matches(/\d/, { message: 'Password must contain at least one number.' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Firstname is required.' })
    firstname: string;

    @IsString()
    @IsNotEmpty({ message: 'Lastname is required.' })
    lastname: string;

    @IsString()
    @IsNotEmpty({ message: 'Position is required.' })
    position: string; // Optional field

    @IsString()
    @IsOptional()
    createdAt?: string; // ISO string, will be converted to Thai time in service
    
    @IsString()
    @IsOptional()
    updatedAt?: string; // ISO string, will be converted to Thai time in service



}
