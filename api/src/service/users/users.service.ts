import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  
  // findByEmail check situation
  async findByEmail(email: string, withPassword = false) {
    if (withPassword) {
      return await this.userModel.findOne({ email }).lean().select('+password').exec();
    }
    return await this.userModel.findOne({ email }).lean().select('-password').exec();
  }

}
