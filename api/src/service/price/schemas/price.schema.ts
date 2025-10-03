import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';@Schema()

@Schema({ collection: 'billing' })
export class Price extends Document {
  @Prop()
  subId: string;

  @Prop()
  service: string;

  @Prop()
  unitPrice: number;
}

export const PriceSchema = SchemaFactory.createForClass(Price);