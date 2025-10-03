import { Module } from '@nestjs/common';
import { OcrServicesImgsService } from './ocr-services-imgs.service';
import { OcrServicesImgsController } from './ocr-services-imgs.controller';
import { AuthModule } from "../auth/auth.module"
import { OcrServicesRateModelModule } from '../ocr-services-rate-model/ocr-services-rate-model.module'

@Module({
  imports: [AuthModule, OcrServicesRateModelModule],
  controllers: [OcrServicesImgsController],
  providers: [OcrServicesImgsService],
  exports: [OcrServicesImgsService],
})
export class OcrServicesImgsModule {}
