import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './service/auth/auth.module';
import { UsersModule } from './service/users/users.module';
import { OcrServicesLogsModule } from './service/ocr-services-logs/ocr-services-logs.module';
import { OcrServicesImgsModule } from './service/ocr-services-imgs/ocr-services-imgs.module';
import { OcrServicesOrgsModule } from './service/ocr-services-orgs/ocr-services-orgs.module';
import { OverallModule } from './service/overall/overall.module';
import { PriceModule } from './service/price/price.module';
import { OcrServicesRateModelModule } from './service/ocr-services-rate-model/ocr-services-rate-model.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/ai-back-offices'),
      }),
    }), 
    AuthModule, UsersModule, OcrServicesLogsModule, OcrServicesImgsModule, OcrServicesOrgsModule, OverallModule, PriceModule, OcrServicesRateModelModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
