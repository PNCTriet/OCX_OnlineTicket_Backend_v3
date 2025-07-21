import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bảo vệ /api bằng basic auth
  app.use(
    ['/api'],
    basicAuth({
      challenge: true,
      users: { 'admin': '250520' }, // đổi user/pass theo ý bạn
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

  // Bật CORS cho mọi domain (phát triển local)
  app.enableCors({
    origin: true, // hoặc ['http://localhost:3001']
    credentials: true, // nếu cần gửi cookie
  });

  await app.listen(3000);
}
bootstrap();
