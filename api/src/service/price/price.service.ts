import { Injectable, BadRequestException, UnprocessableEntityException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { DeletePriceDto } from './dto/delete-price.dto';
import {FilterPriceDto} from './dto/filter-price.dto'
import { BillingResponseDto } from './dto/billing-price-response.dto';
import { InjectModel } from '@nestjs/mongoose';
import { OcrServiceLog } from '../ocr-services-logs/schemas/ocr-services-logs.schema';
import { Price } from './schemas/price.schema';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { getStartOfMonthUTC, getEndOfMonthUTC, createDateRangeQuery, validateDateRange, shiftMonthSafeUTC, addDays, endOfDayUTC, subtractDays, normalizeStartOfDayUTC } from "../../utils/date.util";

@Injectable()
export class PriceService {
  constructor(
    @InjectModel(OcrServiceLog.name) private ocrServiceLogModel: Model<OcrServiceLog>,
    @InjectModel(Price.name) private priceModel: Model<Price>
  ) {}


  async caculatePrice( filter: FilterPriceDto ): Promise<BillingResponseDto> {
    try {
      
      const now = new Date();
      
      if (!filter.subId) {
        throw new UnprocessableEntityException('subId is required');
      }

      // Set default startDate to one month before endDate if not provided
      if (!filter.startDate && filter.endDate) {
        const prevMonth = shiftMonthSafeUTC(new Date(filter.endDate), -1);
        filter.startDate = addDays(prevMonth, 1).toISOString();
        // filter.startDate = shiftMonthSafeUTC(new Date(filter.endDate), -1).toISOString();
      }

      // Set default endDate to one month after startDate if not provided
      if (filter.startDate && !filter.endDate) {
        const nextMonth = shiftMonthSafeUTC(new Date(filter.startDate), 1);
        filter.endDate = subtractDays(nextMonth, 1).toISOString();
        // filter.endDate = shiftMonthSafeUTC(new Date(filter.startDate), 1).toISOString();
      }

      // Normalize startDate and endDate to UTC
      let startDate = filter?.startDate 
        ? normalizeStartOfDayUTC(new Date(filter.startDate)) 
        : getStartOfMonthUTC(now);
      let endDate = filter?.endDate 
        ? endOfDayUTC(new Date(filter.endDate))
        : getEndOfMonthUTC(now);

      // Validate date range
      if (!validateDateRange(startDate, endDate)) {
        throw new BadRequestException('startDate cannot be after endDate');
      }

      const query: any = {};
      query['message.subId'] = filter.subId;
      query['timestamp'] = createDateRangeQuery(startDate, endDate);

      // *****************
      const totalLogs = await this.ocrServiceLogModel.countDocuments(query).lean().exec();
      const priceDoc = await this.priceModel.findOne({ subId: filter.subId }).select('unitPrice').lean().exec();
      const unitPrice = priceDoc?.unitPrice ?? 0;
    
      const totalPrice = totalLogs * unitPrice;
      const response = {
        totalLogs,
        unitPrice,
        totalPrice,
      }

      return plainToInstance(BillingResponseDto, response);
    
    } catch (error) {
        throw error;

    }
  }

  async updatePrice( updatePriceDto: UpdatePriceDto ) {
    try {
      const { subId, service, unitPrice } = updatePriceDto;
      console.log('Update Price DTO:', updatePriceDto);
      
      if (!subId) {
        throw new UnprocessableEntityException('subId is required');
      }

      // if (service === undefined && unitPrice === undefined) {
      //   throw new BadRequestException('At least one must be entered: service or unitPrice');
      // }

      const update: any = {};
      if (service !== undefined) {
        update.service = service;
      }
      if (unitPrice !== undefined) {
        update.unitPrice = unitPrice;
      }

      const priceDoc = await this.priceModel.findOneAndUpdate(
        { subId },
        { $set: update },
        { new: true }
      );

      if (!priceDoc) {
        throw new NotFoundException('Price information not found');
      }

      return {
        message: 'Price updated successfully',
        data: priceDoc,
      };

    
    } catch (error) {
      throw error;
    }
  }


  async deletePrice(deletePriceDto: DeletePriceDto) {
    try {
      
      const { subId, service } = deletePriceDto;
      
      if (!subId) {
        throw new UnprocessableEntityException('subId is required');
      }

      const result = await this.priceModel.findOneAndDelete({ subId, service });
      if (!result) throw new NotFoundException('Price not found');
      
      return { message: 'Deleted successfully' };

    } catch (error) {
      throw error
    }
  
  }


}
