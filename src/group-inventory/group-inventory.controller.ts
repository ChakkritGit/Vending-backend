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
import { UpdateGroupInventoryDto } from './dto/update-group-inventory.dto'
import { GroupType } from 'src/types/groupInventoryType'

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

  @Get(':id')
  findOne (@Param('id') id: string) {
    return this.groupInventoryService.findOne(+id)
  }

  @Patch(':id')
  update (
    @Param('id') id: string,
    @Body() updateGroupInventoryDto: UpdateGroupInventoryDto,
  ) {
    return this.groupInventoryService.update(+id, updateGroupInventoryDto)
  }

  @Delete(':id')
  remove (@Param('id') id: string) {
    return this.groupInventoryService.remove(+id)
  }
}
