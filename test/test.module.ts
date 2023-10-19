import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: ':memory',
      entities: [User],
      synchronize: true,
      autoLoadEntities: true,
      dropSchema: true,
    }),
  ],
})
export class TestModule {}
