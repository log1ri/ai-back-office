import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class UpdatePriceDto {
  @IsNotEmpty()
  @IsString()
  subId: string;

  @IsNotEmpty()
  @IsString()
  service: string;

  @IsNotEmpty()  
  @IsNumber()
  @Min(0)
  unitPrice: number;
}
