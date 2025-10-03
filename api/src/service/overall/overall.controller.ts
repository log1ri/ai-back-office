import { Controller, Get, Query,  UseGuards } from '@nestjs/common';
import { OverallService } from './overall.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard" 
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';


@Controller('overall')
export class OverallController {
  constructor(private readonly overallService: OverallService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('data')
  async overAll(@Query('subId') subId: string) {
    return await this.overallService.overAll(subId);
  }

}
