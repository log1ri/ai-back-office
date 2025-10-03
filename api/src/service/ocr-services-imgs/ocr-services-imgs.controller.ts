import { Controller, Get, Query, Res, UseGuards, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { OcrServicesImgsService } from './ocr-services-imgs.service';
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { FilterOcrIssueImgDto } from './dto/filter-ocr-issue-img.dto'
import { FilterDownloadDto } from './dto/filer-download-img.dto'
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('ocr-services-imgs')
export class OcrServicesImgsController {
  constructor(private readonly ocrServicesImgsService: OcrServicesImgsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('image')
  async getImage(@Query('key') key: string) {
    const url = await this.ocrServicesImgsService.getSignedImageUrl(key);
    return { url };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('list-path')
  async listPath(@Query('prefix') prefix: string) {
    if (!prefix) throw new BadRequestException('ต้องใส่ prefix หรือ path ที่ต้องการ list');
    const keys = await this.ocrServicesImgsService.listObjectsInPrefix(prefix);
  return { keys };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('count-img')
  async countBySubId(@Query('subId') subId: string) {
    return await this.ocrServicesImgsService.countImagesBySubId(subId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('download-zip')
  async downLoadZip(@Query() filter: FilterDownloadDto, @Res({ passthrough: false }) res: Response) {
    try {
      await this.ocrServicesImgsService.downLoadZip(filter, res);
    } catch (error) {
      throw new HttpException(
        'Failed to create zip file', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('download-info')
  async getDownloadInfo(@Query('subId') subId: string) {
    try {
      return await this.ocrServicesImgsService.getDownloadInfo(subId);
    } catch (error) {
      throw new HttpException(
        'Failed to get download info', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('issue-img')
  async getIssueImg(@Query() filter: FilterOcrIssueImgDto) {
    try {
      return await this.ocrServicesImgsService.getIssueImg(filter);
    } catch (error) {
      throw error
    } 
  }
  
  // @Get('get-process-img')
  // async getProcessImg(@Query('subId') subId: string, @Query('status') status: string) {
  //   try {
  //     return await this.ocrServicesImgsService.getProcessImg(subId, status);
  //   } catch (error) {
  //     throw error
  //   } 

  // }

}









