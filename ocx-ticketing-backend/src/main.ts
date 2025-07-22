import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.use(
    ['/api'],
    basicAuth({
      challenge: true,
      users: { 'admin': '250520' }, 
    }),
  );


  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('OCX Online Ticketing API')
    .setDescription('API documentation for OCX Online Ticketing System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  
  app.enableCors({
    origin: true, 
    credentials: true, 
  });

  await app.listen(3000);
}
bootstrap();
