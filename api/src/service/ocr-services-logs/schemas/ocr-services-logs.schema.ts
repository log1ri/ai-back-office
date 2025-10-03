import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class Content {
  @Prop()
  type: string;

  @Prop({ type: String, alias: 'reg-num' })
  regNum: string;

  @Prop()
  province: string;
}
const ContentSchema = SchemaFactory.createForClass(Content);

// Images Subschema
@Schema({ _id: false })
class Images {
  @Prop()
  original: string;

  @Prop()
  processed: string;
}
const ImagesSchema = SchemaFactory.createForClass(Images);

// Message Subschema
@Schema({ _id: false })
class Message {
  @Prop()
  subId: string;

  @Prop()
  status: number;

  @Prop({ type: ImagesSchema })
  images: Images;

  @Prop({ type: ContentSchema })
  content: Content;

  @Prop()
  engine: string;
}
const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({ collection: 'services_logs' })
export class OcrServiceLog extends Document {
  @Prop()
  level: string;

  @Prop()
  action: string;

  @Prop()
  timestamp: Date;

  @Prop({ type: MessageSchema })
  message: Message;
}
export const OcrServiceLogSchema = SchemaFactory.createForClass(OcrServiceLog);