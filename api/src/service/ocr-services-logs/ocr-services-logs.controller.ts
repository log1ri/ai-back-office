import { Controller, Get, Post, Body, Param, Request, UseGuards, Query } from '@nestjs/common';
import { OcrServicesLogsService } from './ocr-services-logs.service';
import { FilterOcrServicesLogDto } from './dto/filter-ocr-services-log.dto'
import { FilterOcrServicesSessionDto } from './dto/filter-ocr-services-session.dto'
import { FilterOcrServicesSessionTodayDto } from './dto/filter-ocr-services-session-today.dto'
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

  // ocr-log pagination and filter
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get("/filter")
  findByFilter(@Request() req, @Query() filter: FilterOcrServicesLogDto) {
    return this.ocrServicesLogsService.findByFilter(filter);
  }

  // ocr-session pagination and filter
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get("/session")
  findSession(@Query() filter: FilterOcrServicesSessionDto) {
    return this.ocrServicesLogsService.findBySessionFilter(filter);
  }

   // total sessions "today"
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get("/session/today/total")
  findSessionToday(@Query('subId') subId: string) {
    return this.ocrServicesLogsService.countSessionsToday(subId);
  }
  
  // list sessions "today"
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('/session/today')
  findSessionsToday(@Query() filter: FilterOcrServicesSessionTodayDto) {
    return this.ocrServicesLogsService.findSessionsToday(filter);
  }

  // count currently inside (open sessions)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('/session/currently-inside/total')
  countCurrentlyInsideOpen(@Query('subId') subId: string) {
    return this.ocrServicesLogsService.countCurrentlyInsideOpen(subId);
  }

  // avg parking time 7d
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('/session/parking-time/avg')
  avgParkingTime7d(@Query('subId') subId: string) {
    return this.ocrServicesLogsService.avgParkingTimeLast(subId);
  }

  // peak entry hour 7d
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('/session/entry/peak-hour')
  peakEntryHour(@Query('subId') subId: string) {
    return this.ocrServicesLogsService.peakEntryHour(subId);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ocrServicesLogsService.findOne(id);
  }
}
