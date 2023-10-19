import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

const configService = new ConfigService();
const PORT = configService.get('PORT') ?? 3001;

const logger = new Logger('Server');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(PORT, () => {
    logger.log(`The server is listening on the port ${PORT}`);
  });
}
bootstrap();
