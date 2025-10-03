import { IsOptional, IsString } from 'class-validator';

export class FilterOcrIssueImgDto {
  @IsString()
  subId?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
