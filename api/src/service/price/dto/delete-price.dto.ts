import { IsString, IsNotEmpty } from 'class-validator';
export class DeletePriceDto {
  @IsString()
  @IsNotEmpty()
  subId: string;

  @IsString()
  @IsNotEmpty()
  service: string; 
}