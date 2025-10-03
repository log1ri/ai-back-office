import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RateLogItemDto {
    @IsNotEmpty()
    @IsString()
    id: string; // logId

    @IsNotEmpty()
    @IsString()
    subId: string;

    @IsNotEmpty()
    @IsString()
    name: string; // imgName

    @IsNotEmpty()
    @IsString()
    province: string;

    @IsNotEmpty()
    @IsString()
    regnum: string;

    @IsNotEmpty()
    @IsString()
    status: string;
}

export class CreateOcrServicesRateModelDto {
  @ValidateNested({ each: true })
  @Type(() => RateLogItemDto)
  items: RateLogItemDto[];
}