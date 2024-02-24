import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';

console.log('DATABASE_PORT', process.env.DATABASE_PORT);

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        port: +configService.get('DATABASE_PORT'),
        host: configService.get('DATABASE_HOST'),
        database: configService.get('DATABASE_NAME'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        entities: [User],
        synchronize: true,
        ssl: true,
      }),
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
