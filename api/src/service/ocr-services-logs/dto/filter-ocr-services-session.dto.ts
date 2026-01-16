import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Max,
  Min,
} from 'class-validator';

export const SESSION_STATUS = ['OPEN', 'CLOSED', 'CONFLICT', 'ABANDONED'] as const;
export type SessionStatus = (typeof SESSION_STATUS)[number];
export const Sort = ['durationSec', 'lastSeenAt', 'createdAt', 'updatedAt'] as const;
export type SortType = (typeof Sort)[number];

export class FilterOcrServicesSessionDto {
  @IsNotEmpty()
  @IsString()
  subId: string;

    // search by reg_num, province, 
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return typeof value === 'string' ? value.trim() || undefined : value;
  })
  @IsString()
  search?: string; 

    
  @IsOptional()
  // @Transform(({ value }) => {
  //   if (value === '' || value === null || value === undefined) return 1;
  //   return parseInt(value, 10);
  // })

  @Transform(({ value, obj, key }) => {
    const raw = obj?.[key as string]; // ค่าจาก query ดิบๆ ก่อน implicit conversion
    if (raw === '' || raw === null || raw === undefined) return 1;

    const v = typeof value === 'string' ? value.trim() : value;
    const n = typeof v === 'number' ? v : parseInt(String(v), 10);

    return Number.isFinite(n) ? n : 1;
  })
  @IsInt()
  @Min(1)
  page: number =1;

  @IsOptional()
  // @Transform(({ value }) => {
  //   if (value === '' || value === null || value === undefined) return 10;
  //   return parseInt(value, 10);
  // })
  @Transform(({ value, obj, key }) => {
    const raw = obj?.[key as string];
    if (raw === '' || raw === null || raw === undefined) return 10;

    const v = typeof value === 'string' ? value.trim() : value;
    const n = typeof v === 'number' ? v : parseInt(String(v), 10);

    return Number.isFinite(n) ? n : 10;
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined ) return undefined;
    return typeof value === 'string' ? value.toUpperCase() : value.toUpperCase();
  })
  @IsIn(SESSION_STATUS)
  status?: SessionStatus ;

  // sort by 'durationSec', 'lastSeenAt', 'createdAt', 'updatedAt'
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return 'lastSeenAt';
    return value;
  })
  @IsIn(Sort)
  sortBy: SortType = 'lastSeenAt';

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return 'asc';
    return typeof value === 'string' ? value.toLowerCase() : value;
  })
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';

}