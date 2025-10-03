// dto/filter-download.dto.ts
import { IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FilterDownloadDto {
    @IsNotEmpty()
    @IsString()
    subId: string;
    
    @IsNotEmpty()
    @IsString()
    status: string;
    
    @IsOptional()
    @IsISO8601()
    startDate?: string; // inclusive

    @IsOptional()
    @IsISO8601()
    endDate?: string;   // inclusive

}
