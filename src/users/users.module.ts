import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: './uploads/users',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, process.env.NODE_ENV === 'development' ? '../..' : '..', 'uploads'),
      serveRoot: '/uploads',
    })
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
