import { Expose } from 'class-transformer';

export class BillingResponseDto {
  @Expose()
  totalLogs: number;

  @Expose()
  unitPrice: number;

  @Expose()
  totalPrice: number;

}