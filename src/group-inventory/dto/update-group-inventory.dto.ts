import { PartialType } from '@nestjs/swagger';
import { CreateGroupInventoryDto } from './create-group-inventory.dto';

export class UpdateGroupInventoryDto extends PartialType(CreateGroupInventoryDto) {}
