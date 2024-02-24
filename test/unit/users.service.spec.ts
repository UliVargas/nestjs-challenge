import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../src/modules/users/users.service';
import { User } from '../../src/access-data/typeorm/entities/user.entity';
import { mockRepository } from '../../test/dependencies';
import {
  createUserDto,
  loginUserDto,
  updateUserDto,
  user,
} from '../../test/mock/user.mock';
import brcypt from 'bcrypt';

describe('UsersService', () => {
  let usersService: UsersService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('Create User', () => {
    it('should create a new user', async () => {
      jest.spyOn(mockRepository, 'create').mockReturnValue(createUserDto);
      jest.spyOn(brcypt, 'hash').mockResolvedValue('Test123' as never);
      jest.spyOn(mockRepository, 'save').mockReturnValue(createUserDto);

      const result = await usersService.create(createUserDto);

      expect(result).toEqual(createUserDto);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('Find All Users', () => {
    it('should return an array of users', async () => {
      jest.spyOn(mockRepository, 'find').mockReturnValue([user]);
      const result = await usersService.findAll();

      expect(result).toEqual([user]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('Find One User By Id', () => {
    it('should return a user by ID', async () => {
      jest.spyOn(mockRepository, 'findOneBy').mockReturnValue(user);
      const result = await usersService.findOne(user.id);

      expect(result).toEqual(user);
      expect(mockRepository.findOneBy).toHaveBeenCalled();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: user.id });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(mockRepository, 'findOneBy').mockReturnValue(undefined);
      try {
        await usersService.findOne(user.id);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('Update User', () => {
    it('should update a user', async () => {
      jest.spyOn(mockRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(mockRepository, 'save').mockResolvedValue({
        ...user,
        ...updateUserDto,
      });
      const result = await usersService.update(user.id, updateUserDto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: user.id });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...user,
        ...updateUserDto,
      });
      expect(result).toEqual({ ...user, ...updateUserDto });
    });
  });

  describe('Remove User By Id', () => {
    it('should delete a user', async () => {
      await usersService.remove(user.id);
      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: user.id,
      });
    });
  });

  describe('Login User', () => {
    it('should return a user and token on successful login', async () => {
      jest.spyOn(mockRepository, 'findOneBy').mockReturnValue(user);
      jest.spyOn(brcypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('test_token');

      const result = await usersService.login(loginUserDto);

      expect(result).toEqual({ ...user, token: 'test_token' });
    });

    it('should throw NotFoundException if user is not found during login', async () => {
      const loginUserDto = {
        email: 'nonexistent@example.com',
        password: 'password',
      };

      jest.spyOn(mockRepository, 'findOneBy').mockReturnValue(undefined);

      try {
        await usersService.login(loginUserDto);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it('should throw BadRequestException on invalid password during login', async () => {
      const loginUserDto = {
        email: 'test@example.com',
        password: 'invalid_password',
      };

      jest.spyOn(mockRepository, 'findOneBy').mockReturnValue(user);
      mockJwtService.sign.mockReturnValue('test_token');

      try {
        await usersService.login(loginUserDto);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });
});
