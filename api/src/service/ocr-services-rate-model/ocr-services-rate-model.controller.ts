import { Controller, Get, Post, Body, UseGuards, Request, ValidationPipe, Query } from '@nestjs/common';
import { OcrServicesRateModelService } from './ocr-services-rate-model.service';
import { CreateOcrServicesRateModelDto, RateLogItemDto } from './dto/create-ocr-services-rate-model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';


@Controller('ocr-services-rate-model')
export class OcrServicesRateModelController {
  constructor(private readonly ocrServicesRateModelService: OcrServicesRateModelService) {}
    
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Post('/check-rate')
  create(  @Body(new ValidationPipe({ transform: true, whitelist: true }))
  rateLogItems: RateLogItemDto[],
  @Request() req ) {
    const uid = req.user?.userId;
    return this.ocrServicesRateModelService.create(rateLogItems, uid);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('/list-rate')
  listRate(@Query('subId') subId: string) {
    return this.ocrServicesRateModelService.listRate(subId);
  }

}
