import { Module } from '@nestjs/common';
import { DispenseService } from './dispense.service';
import { DispenseController } from './dispense.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DispenseController],
  providers: [DispenseService],
})
export class DispenseModule {}
