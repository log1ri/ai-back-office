import { IsOptional, IsString } from 'class-validator';

export class FilterOcrServicesLogDto {
  
  @IsString()
  subId: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
