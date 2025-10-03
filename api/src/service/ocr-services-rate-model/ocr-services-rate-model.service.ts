import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateOcrServicesRateModelDto, RateLogItemDto } from './dto/create-ocr-services-rate-model.dto';
import { RateModel } from './schemas/rate-model.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus } from '@nestjs/common';


@Injectable()
export class OcrServicesRateModelService {
  constructor(@InjectModel(RateModel.name) private rateModel: Model<RateModel>) {}

  async create(payloadItems: RateLogItemDto[], uid: string) {
    try {
      const items = Array.isArray(payloadItems) ? payloadItems : [payloadItems];
      const ops: any[] = [];
      const errors: { index: number; reason: string }[] = [];

      items.forEach((it, i) => {
        const id       = it.id?.trim();
        const subId    = it.subId?.trim();
        const imgName  = it.name?.trim();
        const province = it.province?.trim();
        const regNum   = it.regnum.replace(/[\s-]/g, '');

        const or: any[] = [];
        if (id) or.push({ logId: id });
        if (imgName) or.push({ imgName: imgName });

        if (!or.length) {
          errors.push({ index: i, reason: 'missing key: require id, imgName, or province+regnum' });
          return;
        }

        ops.push({
          updateOne: {
            filter: { $or: or },
            update: {
              $set: {
                logId: id || undefined,
                subId: subId, 
                imgName: imgName || undefined,
                province: province || undefined,
                regNum: regNum || undefined,
                status: it.status ?? undefined,   
                whoIsCreate: uid,          
                // updateAt: new Date(),
              },
              $setOnInsert: { createAt: new Date() },
              $currentDate: { updateAt: true }
            },
            upsert: true,
          },
        });
      });
      
      if (ops.length === 0) {
        throw new UnprocessableEntityException('No valid items to upsert.');
      }

      const r = await this.rateModel.bulkWrite(ops, { ordered: false });

      return {
        status: HttpStatus.CREATED,
        message: 'Upsert rate log(s) successfully',
        summary: {
          matched:  r.matchedCount,
          modified: r.modifiedCount,
          upserted: r.upsertedCount,
        },
      errors, 
    };
    } catch (error) {
      throw error;
    }
  }

  async listRate(subId: string) {
    try {
      const data = await this.rateModel.aggregate([
        { $match: { subId } },
        { $sort: { updateAt: -1, _id: -1 } },
        { $project: {
            _id: 1,
            logId: 1,
            imgName: 1,
            subId: 1,
            province: 1,
            regNum: 1,
            status: 1,
            createAt: 1,
            updateAt: 1,
            whoIsCreate: 1,
        }}    
      ]).exec();
      return {
        status: HttpStatus.OK,
        message: 'List rate fetched successfully',
        data,
      };

    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error fetching list rate',
        error: error.message,
      };
    }
  }


}
