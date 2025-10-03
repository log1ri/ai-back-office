import { IsNotEmpty, IsString } from 'class-validator';
import { Expose, Transform  } from 'class-transformer';
export class OrganizationResponseDto {

  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  _id: string;

  @Expose()
  organization: string;

  @Expose()
  profilePic: string;
}