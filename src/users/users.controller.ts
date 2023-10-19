import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from '../auth/decorators/auth-decorator';
import { LoginUserDto } from './dto/login-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginData } from './interfaces/login.interface';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth()
  @ApiCreatedResponse({ type: User })
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Auth()
  @ApiOkResponse({ type: User, isArray: true })
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Auth()
  @ApiOkResponse({ type: User })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Auth()
  @ApiOkResponse({ type: User })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Auth()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Post('login')
  @ApiCreatedResponse({
    type: LoginData,
  })
  login(@Body() payload: LoginUserDto): Promise<LoginData> {
    return this.usersService.login(payload);
  }
}
