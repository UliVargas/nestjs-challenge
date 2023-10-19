import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class LoginData extends User {
  @ApiProperty()
  token: string;
}
