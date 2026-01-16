import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException, UnprocessableEntityException} from '@nestjs/common';
import { OcrServiceLog } from './schemas/ocr-services-logs.schema';
import { OcrServiceSession } from './schemas/ocr-services-sessions.schema';
import { OcrServicesImgsService } from '../ocr-services-imgs/ocr-services-imgs.service';
import { LogRealtimeDto } from './dto/realtime-ocr-services-log.dto';
import { FilterOcrServicesLogDto } from './dto/filter-ocr-services-log.dto';
import { FilterRealtimeLogsDto} from './dto/filter-realtime-ocr-services-log.dto';
import { FilterOcrServicesSessionDto } from './dto/filter-ocr-services-session.dto';
import { OcrServicesLogsResponseDto } from './dto/ocr-services-logs.dto'
import { OcrServicesSessionResponseDto } from './dto/ocr-services-sessions.dto';
import { validateDateRange, shiftMonthSafeUTC, createDateRangeQuery, addDays, normalizeStartOfDayUTC, endOfDayUTC } from '../../utils/date.util';
@Injectable()
export class OcrServicesLogsService {
  constructor(
    @InjectModel(OcrServiceLog.name) private ocrServiceLogModel: Model<OcrServiceLog>,
    @InjectModel(OcrServiceSession.name) private ocrServiceSessionModel: Model<OcrServiceSession>,
    private ocrServicesImgsService: OcrServicesImgsService,
  ) {}

  // Method to get all logs
  async findAll(): Promise<OcrServiceLog[]> {
    return this.ocrServiceLogModel.find().exec();
  }
  
  // Method to find a log by ID
  async findOne(id: string): Promise<OcrServiceLog | null> {
    return this.ocrServiceLogModel.findById(id).exec();
  }

  // Method to find logs by filter
  async findByFilter(filter: FilterOcrServicesLogDto): Promise<OcrServicesLogsResponseDto> {

    try
    {
      const query: any = {};

      // Filter by subId if provided
      if (!filter.subId) {
        throw new UnprocessableEntityException('subId is required');
      } 
      
      query['message.subId'] = filter.subId;
      // Pagination (default)
      const page = Math.max(1, parseInt(filter.page ?? '1', 10) || 1);
      const limit = Math.max(Math.min(100, parseInt(filter.limit ?? '10', 10) || 10), 1);
      const skip = (page - 1) * limit;
      
      // Fetch data and total count
      const [data, total] = await Promise.all([
        this.ocrServiceLogModel.find(query).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
        this.ocrServiceLogModel.countDocuments(query)
      ]);

      // Format image URLs
      const formattedStringKey = (str: string) => {
        return str.split(".com/")[1]
      };

      // Map through data to format image URLs
      const formattedData = await Promise.all(data.map(async (item) => {
        const originalImagePath = formattedStringKey(item.message.images?.original || '');
        const processedImagePath = formattedStringKey(item.message.images?.processed || '');
        
        const originalImage =  originalImagePath ? await this.ocrServicesImgsService.getSignedImageUrl(originalImagePath) : '';
        const processedImage =  processedImagePath ? await this.ocrServicesImgsService.getSignedImageUrl(processedImagePath) : '';

        return {
          ...item,
          message: {
            ...item.message,
            images: {
              original: originalImage,
              processed: processedImage
            },
            content: {
              ...item.message.content,
              'reg-num': item.message.content['reg-num'] || ''
            }
          }
        };
      }))

      // Calculate pagination details
      const total_pages = Math.ceil(total / limit);
      const nextPage = page < total_pages ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;

      // Prepare pagination object
      const pagination = {
        total_records: total,
        current_page: page,
        total_pages: total_pages,
        next_page: nextPage,
        prev_page: prevPage,
      };

      // Return formatted data with pagination
      return {
        data: formattedData,
        ...pagination,
      };
    } catch (error) {
      throw error;
    }
  }
  

  // Method to find logs for real-time updates
  async findLogsForRealTime( filter:FilterRealtimeLogsDto ): Promise<LogRealtimeDto[]> {
    try {
      
      if (!filter.subId) {
        throw new UnprocessableEntityException('subId is required');
      }
      
      if (!filter?.startDate && filter?.endDate) {
        const prevMonth = shiftMonthSafeUTC(new Date(filter?.endDate), -3);
        filter.startDate = addDays(prevMonth, 1).toISOString();
      }
    
      // If only startDate is provided, set endDate to now 
      if (!filter?.endDate && filter?.startDate) {
        filter.endDate = new Date().toISOString();
    }
              
      // Set default startDate and endDate to now
      const now = new Date();
      let startDate = filter?.startDate 
        ? normalizeStartOfDayUTC(new Date(filter.startDate)) 
        : normalizeStartOfDayUTC(shiftMonthSafeUTC(now, -3));
      let endDate = filter?.endDate 
        ? endOfDayUTC(new Date(filter.endDate)) 
        : endOfDayUTC(now);
      
      // Validate date range
      if (!validateDateRange(startDate, endDate)) {
        throw new InternalServerErrorException('Start date cannot be after end date');
      }
      
      const query: any = {};
      query['message.subId'] = filter.subId;
      query['timestamp'] = createDateRangeQuery(startDate, endDate);

      // Fetch logs with specific fields and sort by timestamp
      const logs = await this.ocrServiceLogModel.find(
        query,
        {
          _id: 1,
          action: 1,
          timestamp: 1,
          'message.subId': 1,
          'message.status': 1,
          'message.content.reg-num': 1,
          'message.content.province': 1,
          'message.engine': 1,
        }
      )
      .sort({ timestamp: -1 })
      .lean() 
      .exec();

      // Map logs to LogRealtimeDto format
      return logs.map(log => ({
        id: log._id?.toString(),
        action: log.action,
        timestamp: new Date(log.timestamp),
        subId: log.message?.subId,
        status: log.message?.status,
        regNum: log.message?.content?.['reg-num'],
        province: log.message?.content?.province === "" ? null : log.message?.content?.province,
        engine: log.message?.engine,
      }));

    } catch (error) {
      throw error;
    }
  }

  async findBySessionFilter(filter: FilterOcrServicesSessionDto): Promise<OcrServicesSessionResponseDto> {
    try
    {
      
      // Filter by subId if provided
      if (!filter.subId) {
        throw new UnprocessableEntityException('subId is required');
      } 

      const query: any = {};
      query['subId'] = filter.subId;

      if (filter.status) {
        query['status'] = filter.status;
      }

      const escapeRegex = (input: string) =>
        input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // ✅ search: ค้นหาได้หลาย field (ตัวอย่าง reg_num/province/status)
      if (filter.search && filter.search.trim() !== '') {
        const search = escapeRegex(filter.search.trim());
        query.$or = [
          { reg_num: { $regex: search, $options: 'i' } },
          { province: { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } },
        ];
      }

      const sortField = filter.sortBy ?? 'lastSeenAt';
      const sortOrder = filter.order === 'asc' ? 1 : -1;

      // Pagination (default)
      const page = filter.page;
      const limit = filter.limit;
      if (!page || !limit) {
        throw new UnprocessableEntityException('page and limit are required');
      }
      const skip = (page - 1) * limit;
      
      // Fetch data and total count
      const [data, total] = await Promise.all([
        this.ocrServiceSessionModel
          .find(query)
          .sort({ [sortField]: sortOrder })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.ocrServiceSessionModel.countDocuments(query)
      ]);



      // Map through data to format image URLs
      const formattedData = await Promise.all(data.map(async (item) => {

        return {
          ...item,
        };
      }))

      // Calculate pagination details
      const total_pages = Math.ceil(total / limit);
      const nextPage = page < total_pages ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;

      // Prepare pagination object
      const pagination = {
        total_records: total,
        current_page: page,
        total_pages: total_pages,
        next_page: nextPage,
        prev_page: prevPage,
      };

      // Return formatted data with pagination
      return {
        data: formattedData,
        ...pagination,
      };
    } catch (error) {
      throw error;
    }
  
  
  
  } 


}
