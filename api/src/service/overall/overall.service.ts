import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {OcrServicesImgsService} from '../ocr-services-imgs/ocr-services-imgs.service'
import { OcrServiceLog } from '../ocr-services-logs/schemas/ocr-services-logs.schema';
@Injectable()
export class OverallService {
  constructor(
    @InjectModel(OcrServiceLog.name) private OcrServiceLog: Model<OcrServiceLog>,
    private readonly ocrServicesImgsService: OcrServicesImgsService) {}

  async overAll(subId: string) {

    try{
      if (!subId) {
        throw new UnprocessableEntityException('subId is required');
      } 

      // count from digital ocean
      const countImgs = await this.ocrServicesImgsService.getImgInfo(subId)    
      const today = new Date();
      today.setHours(0,0,0,0);

      // count from ocr
      const usage = await this.OcrServiceLog.countDocuments();
      const dailyUsage = await this.OcrServiceLog.countDocuments({
        createdAt: { $gte: today }
      });

      return { 
        Image: countImgs.processImages,
        IssueImage: countImgs.issueImages,
        DailyUsage: dailyUsage,
        usage: usage,
       }
    } catch(error){
      throw error
    }
  }
}
