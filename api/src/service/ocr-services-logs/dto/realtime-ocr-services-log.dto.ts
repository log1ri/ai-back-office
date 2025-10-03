import { IsDate, IsString, IsNumber, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
export class LogRealtimeDto {

  @IsString()  
  id: string;

  @IsString()
  action: string;

  // @IsDate()
  timestamp: Date ;

  @IsString()
  subId: string ;

  @IsNumber()
  status: number ;

  @IsString()
  regNum: string ;

  @IsString()
  @IsOptional()
  province?: string | null; 
  
  @IsString()
  engine: string; 
}