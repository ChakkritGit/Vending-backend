import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { initRabbitMq } from './services/rabbit.mq'
import * as morgan from 'morgan'

async function bootstrap () {
  const logger = new Logger('HTTP')
  const app = await NestFactory.create(AppModule)
  const reflector = app.get(Reflector)
  app.enableCors({ origin: '*' })
  const config = new DocumentBuilder()
    .setTitle('Vending')
    .setDescription('The vending API description')
    .setVersion('1.0')
    .addTag('Vending')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)
  app.use(
    morgan(
      '⚡ :method - [:status] :url | :res[content-length] B - :response-time ms',
      {
        stream: {
          write: (message: string) => {
            logger.log(message.trim())
          },
        },
      },
    ),
  )
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.useGlobalInterceptors(new ResponseInterceptor(reflector))
  app.useGlobalFilters(new AllExceptionsFilter())
  app.setGlobalPrefix('api')
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0', () => {
    initRabbitMq()
  })
}
bootstrap()
