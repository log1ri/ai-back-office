import { Module } from '@nestjs/common';
import { OcrServicesLogsService } from './ocr-services-logs.service';
import { OcrServicesLogsController } from './ocr-services-logs.controller';
import {OcrServiceLog, OcrServiceLogSchema}  from './schemas/ocr-services-logs.schema';
import { AuthModule } from '../auth/auth.module';
import {OcrServicesImgsModule} from '../ocr-services-imgs/ocr-services-imgs.module'
import { MongooseModule } from '@nestjs/mongoose';
import { OcrServicesLogsGateway } from './ocr-services-logs.gateway';

@Module({
  imports: [
    AuthModule,
    OcrServicesImgsModule,
    MongooseModule.forFeature([{ name: OcrServiceLog.name, schema: OcrServiceLogSchema }]),
  ],
  controllers: [OcrServicesLogsController],
  providers: [OcrServicesLogsService, OcrServicesLogsGateway],
  exports: [OcrServicesLogsService, OcrServicesLogsGateway, MongooseModule.forFeature([{ name: OcrServiceLog.name, schema: OcrServiceLogSchema }])],
})
export class OcrServicesLogsModule {}
