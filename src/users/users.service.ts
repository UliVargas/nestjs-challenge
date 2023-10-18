import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './interface/user.interface';
import { v4 as UUID } from 'uuid'

@Injectable()
export class UsersService {
  private Users: User[] = []

  create(createUserDto: CreateUserDto) {
    const newUser = {
      ...createUserDto,
      id: UUID()
    }

    this.Users.push(newUser);
    return newUser;
  }

  findAll() {
    return this.Users;
  }

  findOne(id: string) {
    return this.Users.find(user => user.id === id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    this.Users.forEach((user, i) => {
      if (user.id === id) {
        this.Users[i] = {
          ...user,
          ...updateUserDto
        }
      }
    })
  }

  remove(id: string) {
    const users = this.Users.filter(user => user.id !== id);
    this.Users = [...users]
    return `User with ${id} has deleted`
  }
}
