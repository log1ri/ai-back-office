import { IsString } from 'class-validator';
import { Role } from 'src/service/auth/enums/role.enum';


export class validateUser extends Document {
    @IsString()
    _id: string;

    @IsString()
    email: string;

    @IsString()
    role: Role;
}








