import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PriceService } from './price.service';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { DeletePriceDto } from './dto/delete-price.dto';
import { FilterPriceDto } from './dto/filter-price.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Get('caculate')
  caculatePrice(@Query() filter: FilterPriceDto) {
    return this.priceService.caculatePrice(filter);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Delete('billing')
  async deletePrice(@Query() deletePriceDto: DeletePriceDto) {
    return this.priceService.deletePrice(deletePriceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Supervisor, Role.Manager, Role.Guest)
  @Patch('billing')
  async updatePrice(@Body() updatePriceDto: UpdatePriceDto) {
    return this.priceService.updatePrice(updatePriceDto);
  }

}
