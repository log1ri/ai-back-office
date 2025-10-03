import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsISO8601, IsNotEmpty } from 'class-validator';
export class FilterPriceDto {
  @IsString()
  subId: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsISO8601()
  endDate?: string;

}