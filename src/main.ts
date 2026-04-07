import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@core/config/config.service';
import { winstonLogger } from '@common/logger/winston.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ trustProxy: true }), {
    logger: winstonLogger,
  });
  const logger = new Logger('Bootstrap');

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const apiHost = configService.apiHost;
  const nodeEnv = configService.get('NODE_ENV');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api', {
    exclude: [
      { path: '', method: RequestMethod.GET },
      { path: 'health', method: RequestMethod.GET },
    ],
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle('My Awesome API')
    .setDescription('The API documentation for my awesome template')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(apiHost, nodeEnv)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on: ${apiHost}`);
  logger.log(`Documentation available at: ${apiHost}/api/docs`);
  logger.log(`Swagger JSON available at: ${apiHost}/api/docs-json`);
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
