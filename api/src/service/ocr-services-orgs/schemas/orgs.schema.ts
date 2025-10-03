import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'org' })
export class Organization extends Document {
  @Prop()
  invite_code: string;

  @Prop()
  organization: string;

  @Prop()
  profilePic: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);