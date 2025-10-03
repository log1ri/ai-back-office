import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import {OcrServicesLogsModule} from '../ocr-services-logs/ocr-services-logs.module'
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Price, PriceSchema }  from './schemas/price.schema';

@Module({
  imports: [
    AuthModule,
    OcrServicesLogsModule,
    MongooseModule.forFeature([{ name: Price.name, schema: PriceSchema }]),
  ],
  controllers: [PriceController],
  providers: [PriceService],
})
export class PriceModule {}
