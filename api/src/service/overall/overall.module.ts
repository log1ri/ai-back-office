import { Module } from '@nestjs/common';
import { OverallService } from './overall.service';
import { OverallController } from './overall.controller';
import {OcrServicesImgsModule} from '../ocr-services-imgs/ocr-services-imgs.module';
import { OcrServicesLogsModule } from '../ocr-services-logs/ocr-services-logs.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OcrServiceLog, OcrServiceLogSchema} from '../ocr-services-logs/schemas/ocr-services-logs.schema'
import { AuthModule } from '../auth/auth.module'


@Module({
  imports: [OcrServicesImgsModule, OcrServicesLogsModule, AuthModule,
    MongooseModule.forFeature([
      { name: OcrServiceLog.name, schema: OcrServiceLogSchema },
    ]),
  ],
  controllers: [OverallController],
  providers: [OverallService],
})
export class OverallModule {}
