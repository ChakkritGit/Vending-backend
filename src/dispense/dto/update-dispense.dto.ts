import { PartialType } from '@nestjs/swagger';
import { CreateDispenseDto } from './create-dispense.dto';

export class UpdateDispenseDto extends PartialType(CreateDispenseDto) {}
