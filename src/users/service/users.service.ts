import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { DBErrors } from '../../utils/database-errors';

@Injectable()
export class UsersService {
  private logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashed = await hash(createUserDto.password, 10);
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashed,
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      this.logger.error(error);
      DBErrors(error);
    }
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const user = this.findOne(id);
    return this.userRepository.save({
      ...user,
      ...updateUserDto,
    });
  }

  remove(id: string) {
    return this.userRepository.delete({
      id,
    });
  }

  async login(payload: { email: string; password: string }) {
    const user = await this.userRepository.findOneBy({ email: payload.email });
    if (!user) throw new NotFoundException('User not found');

    if (!compare(payload.password, user.password))
      throw new BadRequestException('email or password invalid');

    const token = this.jwtService.sign({
      id: user.id,
    });

    return {
      ...user,
      token,
    };
  }
}
