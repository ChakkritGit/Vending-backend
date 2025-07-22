import { Body, Controller, Get, Param, Patch } from '@nestjs/common'
import { ConfigService } from './config.service'
import { UserBiometrics } from '@prisma/client'

@Controller('config')
export class ConfigController {
  constructor (private readonly configService: ConfigService) {}

  @Get('user')
  findAll () {
    return this.configService.findAll()
  }

  @Get('fingerprint/:id')
  findFingerprintByUserId (@Param('id') id: string) {
    return this.configService.findFingerprint(id)
  }

  @Patch('fingerprint/:id')
  updateFungerprint (@Param('id') id: string, @Body() bio: UserBiometrics) {
    return this.configService.updateFingerprint(id, bio)
  }
}
