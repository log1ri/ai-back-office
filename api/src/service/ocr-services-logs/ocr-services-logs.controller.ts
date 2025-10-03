import { Controller, Get, Post, Body, Param, Request, UseGuards, Query } from '@nestjs/common';
import { OcrServicesLogsService } from './ocr-services-logs.service';
import { FilterOcrServicesLogDto } from './dto/filter-ocr-services-log.dto'
import { OcrServiceLog } from './schemas/ocr-services-logs.schema'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('ocr-services-logs')
export class OcrServicesLogsController {
  constructor(private readonly ocrServicesLogsService: OcrServicesLogsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor)
  @Get("all")
  findAll() {
    return this.ocrServicesLogsService.findAll();
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get("/filter")
  findByFilter(@Request() req, @Query() filter: FilterOcrServicesLogDto) {
    return this.ocrServicesLogsService.findByFilter(filter);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ocrServicesLogsService.findOne(id);
  }
}
