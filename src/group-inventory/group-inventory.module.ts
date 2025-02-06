import { Module } from '@nestjs/common';
import { GroupInventoryService } from './group-inventory.service';
import { GroupInventoryController } from './group-inventory.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GroupInventoryController],
  providers: [GroupInventoryService],
})
export class GroupInventoryModule {}
