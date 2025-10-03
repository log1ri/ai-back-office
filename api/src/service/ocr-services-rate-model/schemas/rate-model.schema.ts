import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({
  timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' },
  collection: 'rate-model',
})
export class RateModel extends Document {
  @Prop({ required: true, trim: true, index: true, unique: true, immutable: true }) 
  logId: string;

  @Prop({ required: true, unique: true })
  imgName: string;
  
  @Prop({ required: true })
  subId: string;

  @Prop({ required: true })
  province: string;

  @Prop({ required: true })
  regNum: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  whoIsCreate: string;

  @Prop({ required: true })
  createAt: Date;

  @Prop({ required: true })
  updateAt: Date;
}

export const RateModelSchema = SchemaFactory.createForClass(RateModel);