import { IsOptional, IsString, IsISO8601, IsNotEmpty } from 'class-validator';
export class FilterRealtimeLogsDto {
  @IsString()
  @IsNotEmpty()
  subId: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

}