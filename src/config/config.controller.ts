import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { ConfigService } from './config.service'
import { CreateConfigDto } from './dto/create-config.dto'
import { UpdateConfigDto } from './dto/update-config.dto'

@Controller('config')
export class ConfigController {
  constructor (private readonly configService: ConfigService) {}

  @Get('user')
  findAll () {
    return this.configService.findAll()
  }
}
