import { Controller, Get, UseGuards} from '@nestjs/common';
import { OcrServicesOrgsService } from './ocr-services-orgs.service';
import {OrganizationResponseDto} from './dto/get-all-org.dto'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('ocr-services-orgs')
export class OcrServicesOrgsController {
  constructor(private readonly ocrServicesOrgsService: OcrServicesOrgsService) {}

  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get("all")
  findAll(): Promise<OrganizationResponseDto[]> {
    return this.ocrServicesOrgsService.findAll();
  }
}
