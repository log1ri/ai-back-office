import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument  } from 'mongoose';

export type OcrServiceSessionDocument = HydratedDocument<OcrServiceSession>;

const SESSION_STATUS = ['OPEN', 'CLOSED', 'CONFLICT', 'ABANDONED'] as const;
type SessionStatus = typeof SESSION_STATUS[number];

@Schema({ _id: false })
class Entry {
  @Prop({ required: true })
  logId: string;

  @Prop({ required: true })
  camId: string;

  @Prop({ required: true })
  time: Date;

}
const EntrySchema = SchemaFactory.createForClass(Entry);

@Schema({ _id: false })
class Exit {
  @Prop({ required: true })
  logId: string;

  @Prop({ required: true })
  camId: string;

  @Prop({ required: true })
  time: Date;

}
const ExitSchema = SchemaFactory.createForClass(Exit);


@Schema({ 
    collection: 'vehicle_sessions', 
})
export class OcrServiceSession {
    @Prop({ required: true, index: true })
    organization: string;

    @Prop({ required: true })
    subId: string;
    @Prop()
    reg_num: string;
    @Prop()
    province: string;
    @Prop({ required: true })
    status: SessionStatus;

    @Prop({  type: EntrySchema, default: null })
    entry: Entry | null;

    @Prop({  type: ExitSchema, default: null })
    exit: Exit | null;

    @Prop({ type: Number, required: false, default: null })
    durationSec?: number | null;

    @Prop({ default: () => new Date() })
    lastSeenAt: Date;
    @Prop()
    createdAt: Date;
    @Prop()
    updatedAt: Date;


}
export const OcrServiceSessionSchema = SchemaFactory.createForClass(OcrServiceSession);

OcrServiceSessionSchema.index(
  { subId: 1, status: 1, lastSeenAt: -1 }
);