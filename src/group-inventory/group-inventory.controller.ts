import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { GroupInventoryService } from './group-inventory.service'
import { GroupInventoryUpdateType, GroupType, StockUpdateType } from 'src/types/groupInventoryType'

@Controller('group-inventory')
export class GroupInventoryController {
  constructor (private readonly groupInventoryService: GroupInventoryService) {}

  @Post()
  create (@Body() createGroupInventoryDto: GroupType) {
    return this.groupInventoryService.create(createGroupInventoryDto)
  }

  @Get()
  findAll () {
    return this.groupInventoryService.findAll()
  }

  @Get('stock')
  getStock() {
    return this.groupInventoryService.getInventoryWithDrug()
  }

  @Patch(':id')
  update (
    @Param('id') id: string,
    @Body() updateGroupInventoryDto: GroupInventoryUpdateType,
  ) {
    return this.groupInventoryService.updateGroupAndInventory(id, updateGroupInventoryDto)
  }

  @Patch('stock/:id')
  updateStock (
    @Param('id') id: string,
    @Body() updateGroupInventoryDto: StockUpdateType,
  ) {
    return this.groupInventoryService.updateStock(id, updateGroupInventoryDto)
  }

  @Delete(':id')
  remove (@Param('id') id: string) {
    return this.groupInventoryService.deleteGroup(id)
  }
}
