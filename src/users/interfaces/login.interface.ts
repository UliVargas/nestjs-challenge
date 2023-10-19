import { User } from '../entities/user.entity';

export interface LoginData extends User {
  token: string;
}
