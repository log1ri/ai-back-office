import { PartialType } from '@nestjs/mapped-types';
import { CreateOcrServicesRateModelDto } from './create-ocr-services-rate-model.dto';

export class UpdateOcrServicesRateModelDto extends PartialType(CreateOcrServicesRateModelDto) {}
