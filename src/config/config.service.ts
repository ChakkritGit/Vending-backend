import { Injectable } from '@nestjs/common'
import { CreateConfigDto } from './dto/create-config.dto'
import { UpdateConfigDto } from './dto/update-config.dto'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { buffer } from 'stream/consumers'

@Injectable()
export class ConfigService {
  constructor (private prisma: PrismaService) {}

  async findAll () {
    const allBiometrics = await this.prisma.userBiometrics.findMany({
      include: { user: true },
    })

    const bio = allBiometrics.map(item => {
      return {
        id: item.id,
        userName: item.user.username,
        featureData: Buffer.from(item.featureData).toString('base64'),
      }
    })
    return bio
  }
}
