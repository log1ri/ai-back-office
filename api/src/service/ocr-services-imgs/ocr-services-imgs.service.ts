import { Injectable, Logger, BadRequestException, UnprocessableEntityException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as archiver from 'archiver';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FilterOcrIssueImgDto } from './dto/filter-ocr-issue-img.dto'
import { FilterDownloadDto } from './dto/filer-download-img.dto'
import { OcrServicesRateModelService } from '../ocr-services-rate-model/ocr-services-rate-model.service'
import { validateDateRange, shiftMonthSafeUTC, createDateRangeQuery, addDays, normalizeStartOfDayUTC, endOfDayUTC } from '../../utils/date.util';
import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  
} from '@aws-sdk/client-s3';
import * as path from 'path';

@Injectable() 
export class OcrServicesImgsService {

  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly logger = new Logger(OcrServicesImgsService.name);
 
  constructor(
    private readonly configService: ConfigService,
    private readonly rateModelService: OcrServicesRateModelService
  ) {
    this.bucket = this.configService.get<string>('DO_SPACES_BUCKET')!;
    this.endpoint = this.configService.get<string>('DO_SPACES_ENDPOINT')!;
    
    if (!this.bucket || !this.endpoint) {
      throw new Error('Missing required DigitalOcean Spaces configuration');
    }
    
    this.s3 = new S3Client({
      region: 'sgp1',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.configService.get<string>('DO_SPACES_KEY')!,
        secretAccessKey: this.configService.get<string>('DO_SPACES_SECRET')!,
      },
      maxAttempts: 3,
    });
  }

  async getSignedImageUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: this.bucket,
    Key: key,
  });
  return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }


  async checkPrefixExists(prefix: string): Promise<boolean> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: 1, 
      });
      const res = await this.s3.send(command);

      return !!(res.Contents && res.Contents.length > 0);
    } catch (error) {
      this.logger.error(`Error checking path: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to check path: ' + error.message);
    }
  }
  
  async getObjectStream(key: string): Promise<Readable> {
  try {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const res = await this.s3.send(command);
    
    // Convert Body to Readable stream
    if (res.Body instanceof Readable) {
      return res.Body;
    } else {
      // For cases where Body is another type
      return Readable.from(res.Body as any);
    }
  } catch (error) {
    this.logger.error(`Failed to get object stream for key ${key}: ${error.message}`, error.stack);
    throw new BadRequestException(`Failed to get file: ${key}`);
  }
}

  async listObjectsInPrefix(prefix = '', startDate?: Date, endDate?: Date): Promise<string[]> {
  try {
    let keys: string[] = [];
    let continuationToken: string | undefined = undefined;
    do {
      const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
      });
      const res = await this.s3.send(command) as ListObjectsV2CommandOutput;

      if (res.Contents) {
      // keys = keys.concat(res.Contents.map(obj => obj.Key!));
        const filtered = res.Contents.filter(obj => {
          if (!obj.LastModified) return false;
          const lastMod = new Date(obj.LastModified);
          if (startDate && lastMod < startDate) return false;
          if (endDate && lastMod > endDate) return false;
          return true;
        });
        filtered.forEach(obj => {
        // console.log('LastModified:', obj.LastModified, 'Key:', obj.Key);
});
        keys = keys.concat(filtered.map(obj => obj.Key!));
    }
      // Check if there are more objects to fetch
      continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (continuationToken);

    return keys;

  } catch (error) {
    this.logger.error(`Error listing objects: ${error.message}`, error.stack);
    throw new BadRequestException('Unable to fetch file list: ' + error.message);
  }
}


async countImagesBySubId(subId: string) {

    if (!subId) throw new BadRequestException();

    try {
  
      // const issuePrefix = `rival-ocr-services/${subId}/issue_images/process/`;
      const issuePrefix = this.configService.get<string>(`ISSUE_PREFIX`)?.replace('subId', subId);
      // const processPrefix = `rival-ocr-services/${subId}/process/`;
      const processPrefix = this.configService.get<string>(`PROCESS_PREFIX`)?.replace('subId', subId);

      let issueCount = 0;
      let continuationToken: string | undefined = undefined;
      do {
        const command = new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: issuePrefix,
          ContinuationToken: continuationToken,
        });
        const res = await this.s3.send(command) as ListObjectsV2CommandOutput;

        // Count Issue Images (ends with .jpg)
        issueCount += (res.Contents ?? []).filter(obj =>
          obj.Key?.endsWith('.jpg'),
        ).length;

        continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
      } while (continuationToken);

      // 2. Count Cropped Process Images (cropped_*.jpg)
      let processCount = 0;
      continuationToken = undefined;
      do {
        const command = new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: processPrefix,
          ContinuationToken: continuationToken,
        });
        const res = await this.s3.send(command) as ListObjectsV2CommandOutput;

        processCount += (res.Contents ?? []).filter(obj =>
          obj.Key?.includes('cropped_') && obj.Key?.endsWith('.jpg'),
        ).length;

        continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
      } while (continuationToken);

      return {
        issueImageCount: issueCount,
        processImageCount: processCount,
      };
    } catch (error) {
      this.logger.error(`Error counting images: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async downLoadZip(filter: FilterDownloadDto, res: Response){
    
    try {
      if(!filter.subId){
        throw new BadRequestException('subId is required');
      }

      // Set default startDate if not provided
      if (!filter?.startDate && filter?.endDate) {
        const prevMonth = shiftMonthSafeUTC(new Date(filter?.endDate), -3);
        filter.startDate = addDays(prevMonth, 1).toISOString();
      }

      // Set default endDate if not provided
      if (!filter?.endDate && filter?.startDate) {
        filter.endDate = new Date().toISOString();
      }

      const now = new Date();
      let startDate = filter?.startDate 
        ? normalizeStartOfDayUTC(new Date(filter.startDate)) 
        : normalizeStartOfDayUTC(shiftMonthSafeUTC(now, -1));
      let endDate = filter?.endDate 
        ? endOfDayUTC(new Date(filter.endDate)) 
        : endOfDayUTC(now);

      if (!validateDateRange(startDate, endDate)) {
        throw new InternalServerErrorException('Start date cannot be after end date');
      }    

      // const issuePrefix   = `rival-ocr-services/${filter.subId}/issue_images/process/`;
      // const processPrefix = `rival-ocr-services/${filter.subId}/process/`;
      const issuePrefix = this.configService.get<string>(`ISSUE_PREFIX`)?.replace('subId', filter.subId);
      const processPrefix = this.configService.get<string>(`PROCESS_PREFIX`)?.replace('subId', filter.subId);

      // console.log('Downloading images for subId:', filter.subId);
      // console.log('Date Range:', startDate.toISOString(), 'to', endDate.toISOString());
      // console.log('Issue Prefix:', issuePrefix);
      // console.log('Process Prefix:', processPrefix);

      const processImgObjs = await this.getProcessImg(
        filter.subId,
        filter.status,              
        filter.startDate ? new Date(startDate) : undefined,
        filter.endDate ? new Date(endDate) : undefined
      );
      const processKeys = processImgObjs
        .filter((obj): obj is { processUrl: string } => !!obj && !!obj.processUrl)
        .map(obj => obj.processUrl);

      // console.log('Process Keys:', processKeys);
      // get keys from digital ocean
      const issueKeys = await this.listObjectsInPrefix(issuePrefix, startDate, endDate);

      // set response headers
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filter.subId}_images.zip"`,
      });
    
      // create archive
      const archive = archiver('zip', { zlib: { level: 0} });
      archive.pipe(res);

      // Handle archive errors
      archive.on('error', (err) => {
        this.logger.error(`Archive error: ${err.message}`, err.stack);
        throw err;
      });

      // add issue images
      for (const key of issueKeys) {
        try {
          // const filename = key.replace(issuePrefix ?? '', '');
          const filename = path.basename(key);
          const stream = await this.getObjectStream(key);
          archive.append(stream, { name: `issueImg/${filename}` });
        } catch (error) {
          this.logger.warn(`Failed to add issue image ${key}: ${error.message}`);
          continue;
        }
      }

    // add process images
      for (const key of processKeys) {
        try {
          // const filename = key.replace(processPrefix ?? '', '');
          const filename = path.basename(key);
          const stream = await this.getObjectStream(key);
          archive.append(stream, { name: `processImg-[${filter.status}]/${filename}` });
        } catch (error) {
          this.logger.warn(`Failed to add process image ${key}: ${error.message}`);
          continue;
        }
      }

    await archive.finalize();
    return;


    } catch (error) {
      this.logger.error(`Error creating zip file for subId ${filter.subId}: ${error.message}`, error.stack);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to create zip file',
        message: error.message
      });
    }
    
    throw new BadRequestException(`Failed to create zip file: ${error.message}`);
      
    }
  }

  async getDownloadInfo(subId: string) {
    const issuePrefix = `rival-ocr-services/${subId}/issue_images/process/`;
    const processPrefix = `rival-ocr-services/${subId}/process/`;

    const [issueKeys, processKeys] = await Promise.all([
      this.listObjectsInPrefix(issuePrefix),
      this.listObjectsInPrefix(processPrefix),
    ]);

    return {
      subId,
      totalFiles: issueKeys.length + processKeys.length,
      issueImages: issueKeys.length,
      processImages: processKeys.length,
      estimatedSize: '~' + Math.round((issueKeys.length + processKeys.length) * 0.5) + 'MB', // ประมาณ 500KB ต่อไฟล์
    };
  }


  async getImgInfo(subId: string) {
    const issuePrefix = `rival-ocr-services/${subId}/issue_images/process/`;
    const processPrefix = `rival-ocr-services/${subId}/process/`;

    const [issueKeys, processKeys] = await Promise.all([
      this.listObjectsInPrefix(issuePrefix),
      this.listObjectsInPrefix(processPrefix),
    ]);

    const issueCount = issueKeys.filter(key => key.endsWith('.jpg')).length;
    const processCount = processKeys.filter(key => 
      key.includes('cropped_') && key.endsWith('.jpg')
    ).length;

    return {
      issueImages: issueCount,
      processImages: processCount,
    };
  }


  async getIssueImg(filter: FilterOcrIssueImgDto) {

    try {
      if (!filter.subId) {
        throw new UnprocessableEntityException('subId is required');
      }

      const issuePrefix = `ocr-services/${filter.subId}/issue_images/process/`;
      const issueKeys = await this.listObjectsInPrefix(issuePrefix);

      // Pagination logic
      const page: number = filter.page && Number(filter.page) > 0 ? Number(filter.page) : 1;
      const limit: number = filter.limit && Number(filter.limit) > 0 ? Number(filter.limit) : 100;
      const startIdx: number = (page - 1) * limit;
      const endIdx: number = startIdx + limit;
      const pagedKeys = issueKeys.slice(startIdx, endIdx);

      const signedIssueUrls = await Promise.all(
        pagedKeys.map(async (issueKey)=>{
          try {
            const signedIssueUrl = await this.getSignedImageUrl(issueKey);
            return {

              filename: issueKey.replace(issuePrefix, ''),
              signedUrl: signedIssueUrl
            }
          } catch (error) {
            this.logger.warn(`Failed to sign ${issueKey}: ${error.message}`);
            return null;
          }
        })
      );

      const validUrls = signedIssueUrls.filter(item => item !== null);
      return {
        data: validUrls,
        totalRecords: issueKeys.length,
        currentPage: page,
        totalPages: Math.ceil(issueKeys.length / limit),
        nextPage: endIdx < issueKeys.length ? page + 1 : null,
        prevPage: startIdx > 0 ? page - 1 : null,
      };

    } catch (error) {
      throw error
    }
  }

  async getProcessImg(subId: string, status: string, startDate?: Date, endDate?: Date): Promise<({processUrl: string}| null)[]> {
    try {

    // fetch rate model data
    const rateResult = await this.rateModelService.listRate(subId);
    if (rateResult.status !== 200 || !rateResult.data) {
      throw new InternalServerErrorException('Failed to fetch rate model data');
    }
    
    // filter by status 
    let filtered = rateResult.data.filter(item => item.status === status);

    // filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(item => {
        // console.log('item', item)
        const date = new Date(item.createAt);
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
      });
    }
    console.log('subId:', subId)
    return filtered
      .filter(item => !!item.imgName)
      .map(item => ({
        processUrl: `ocr-services/${subId}/process/cropped_${item.imgName}.jpg`,
      }));

  } catch (error) {
    throw error;
  }
  }
}
