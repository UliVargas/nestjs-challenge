import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { DBErrors } from '../utils/database-errors';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginData } from './interfaces/login.interface';

@Injectable()
export class UsersService {
  private logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
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

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: string): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    return await this.userRepository.save({
      ...user,
      ...updateUserDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete({
      id,
    });
  }

  async login(payload: LoginUserDto): Promise<LoginData> {
    const user = await this.userRepository.findOneBy({ email: payload.email });
    if (!user) throw new NotFoundException('User not found');

    const isValidUser = await compare(payload.password, user.password);

    if (!isValidUser)
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
