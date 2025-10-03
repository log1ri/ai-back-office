import { Module } from '@nestjs/common';
import { OcrServicesOrgsService } from './ocr-services-orgs.service';
import { OcrServicesOrgsController } from './ocr-services-orgs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from '../ocr-services-orgs/schemas/orgs.schema';
import { Users, UsersSchema } from '../users/schemas/users.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Organization.name, schema: OrganizationSchema },
        { name: Users.name, schema: UsersSchema }
      ]), AuthModule
    ], 
  controllers: [OcrServicesOrgsController],
  providers: [OcrServicesOrgsService],
})
export class OcrServicesOrgsModule {}
