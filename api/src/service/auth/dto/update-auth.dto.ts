import { PartialType } from '@nestjs/mapped-types';
import { SignupAuthDto } from './signup-auth.dto';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional  } from 'class-validator';
export class UpdateAuthDto extends PartialType(SignupAuthDto) {
        @IsEmail()
        @IsOptional()
        email?: string;
        
        @IsString()
        @IsOptional()
        @MinLength(6)
        password?: string;
    
        @IsString()
        @IsOptional()
        firstname?: string;
    
        @IsString()
        @IsOptional()
        lastname?: string;
    
        @IsString()
        @IsOptional()
        position?: string; // Optional field
    
        // @IsOptional()
        // updatedAt?: Date; // Optional field, defaults to current date



}
