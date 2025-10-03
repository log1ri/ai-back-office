import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from '../ocr-services-orgs/schemas/orgs.schema';
import {OrganizationResponseDto} from './dto/get-all-org.dto'
import { plainToInstance } from 'class-transformer';
import { Users } from '../users/schemas/users.schema';

@Injectable()
export class OcrServicesOrgsService {
  constructor(
    @InjectModel(Organization.name) 
    private readonly ocrServicesOrgModel: Model<Organization>,
    @InjectModel(Users.name)
    private readonly ocrServicesUserModel: Model<Users>
  ) {}

  async findAll(): Promise<OrganizationResponseDto[]> {
    const orgs = await this.ocrServicesOrgModel.find().select({
      invite_code: 1,
      organization: 1,
      profilePic: 1,
    }).lean().exec();
    
    const users = await this.ocrServicesUserModel.find(
      { invite_code: { $exists: true } }, 
      { invite_code: 1, _id: 1 } 
    ).lean().exec();
    
    const orgsWithSubId = orgs.map(org => {
      const user = users.find(user => user.invite_code === org.invite_code);
      return {
        ...org,
        _id: user ? user._id : undefined, 
      };
    });

    return plainToInstance(OrganizationResponseDto, orgsWithSubId, {
      excludeExtraneousValues: true,
    });
  }
}
