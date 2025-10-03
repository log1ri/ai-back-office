import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Role } from '../../auth/enums/role.enum';

@Schema({ collection: 'admin-users' })
export class User extends Document {
  
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop()
  position: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({
    enum: Role,
    default: Role.Guest
    // required: true,
  })
  role: Role; // 'admin', 'supervisor', 'manager', 'guest'
}


export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', async function (next) {
  // Check if the password is modified before hashing
  if (!this.isModified('password')) return next();
  // Hash the password
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err as Error);
  }
});


@Schema({ collection: 'users' })
export class Users extends Document {
  
  @Prop({ required: true, unique: true })
  invite_code: string;

  @Prop({ required: true })
  username: string;
}

export const UsersSchema = SchemaFactory.createForClass(Users);







