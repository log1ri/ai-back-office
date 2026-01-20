import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsMongoId,
  MaxLength,
} from 'class-validator';


export class FilterOcrServicesSessionTodayDto {
    @IsNotEmpty()
    @IsString()
    @IsMongoId()
    subId: string;

        // search by reg_num, province, 
    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return undefined;
        return typeof value === 'string' ? value.trim() || undefined : value;
    })
    @IsString()
    @MaxLength(100)
    search?: string; 

}