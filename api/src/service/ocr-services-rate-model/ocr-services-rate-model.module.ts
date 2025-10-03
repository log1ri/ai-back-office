import { Module } from '@nestjs/common';
import { OcrServicesRateModelService } from './ocr-services-rate-model.service';
import { OcrServicesRateModelController } from './ocr-services-rate-model.controller';
import {AuthModule} from '../auth/auth.module'
import { MongooseModule } from '@nestjs/mongoose';
import { RateModel, RateModelSchema } from './schemas/rate-model.schema';


@Module({
  imports: [AuthModule,
    MongooseModule.forFeature([{ name: RateModel.name, schema: RateModelSchema }]), 
  ],
  controllers: [OcrServicesRateModelController],
  providers: [OcrServicesRateModelService],
  exports: [OcrServicesRateModelService],
})
export class OcrServicesRateModelModule {}
