import { Module } from '@nestjs/common';
import { DrugsService } from './drugs.service';
import { DrugsController } from './drugs.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: './uploads/drugs',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, process.env.NODE_ENV === 'development' ? '../..' : '..', 'uploads'),
      serveRoot: '/uploads',
    })
  ],
  controllers: [DrugsController],
  providers: [DrugsService],
})
export class DrugsModule {}
