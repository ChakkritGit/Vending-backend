import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateConfigDto } from './dto/create-config.dto'
import { UpdateConfigDto } from './dto/update-config.dto'
import { Prisma, UserBiometrics } from '@prisma/client'
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

  async findFingerprint (id: string) {
    const findFingerprint = await this.prisma.userBiometrics.findMany({
      where: { userId: id },
      select: {
        id: true,
        userId: true,
        type: true,
        description: true,
        createdAt: true,
      },
    })

    if (findFingerprint.length === 0) {
      throw new HttpException('ไม่พบข้อมูลลายนิ้วมือ!', HttpStatus.NOT_FOUND)
    }

    return findFingerprint
  }

  async updateFingerprint (id: string, bio: UserBiometrics) {
    const findFinger = await this.prisma.userBiometrics.findUnique({
      where: { id },
    })

    if(!findFinger) {
      throw new HttpException('ไม่พบข้อมูลลายนิ้วมือ!', HttpStatus.NOT_FOUND)
    }

    await this.prisma.userBiometrics.update({
      where: {id},
      data: {
        description: bio.description
      }
    })

    return "อัปเดทข้อมูลลายนิ้วมือสำเร็จ!"
  }
}
