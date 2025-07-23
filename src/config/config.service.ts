import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UserBiometrics } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { buffer } from 'stream/consumers'
import { UserFingerprintType } from 'src/types/userType'
import { v4 as uuidv4 } from 'uuid'
import { getDateFormat } from 'src/utils/date.format'

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
    const findFingerprint = await this.prisma.users.findFirst({
      where: { id },
      select: {
        biometrics: {
          select: {
            id: true,
            userId: true,
            type: true,
            description: true,
            createdAt: true,
          },
        },
      },
    })

    if (!findFingerprint) {
      throw new HttpException('ไม่พบข้อมูลลายนิ้วมือ!', HttpStatus.NOT_FOUND)
    }

    return findFingerprint
  }

  async updateFingerprint (id: string, bio: UserBiometrics) {
    const findFinger = await this.prisma.userBiometrics.findUnique({
      where: { id },
    })

    if (!findFinger) {
      throw new HttpException('ไม่พบข้อมูลลายนิ้วมือ!', HttpStatus.NOT_FOUND)
    }

    await this.prisma.userBiometrics.update({
      where: { id },
      data: {
        description: bio.description,
      },
    })

    return 'อัปเดทข้อมูลลายนิ้วมือสำเร็จ!'
  }

  async deleteFungerprint (id: string) {
    const findFinger = await this.prisma.userBiometrics.findUnique({
      where: { id },
    })

    if (!findFinger) {
      throw new HttpException('ไม่พบข้อมูลลายนิ้วมือ!', HttpStatus.NOT_FOUND)
    }

    await this.prisma.userBiometrics.delete({
      where: { id },
    })

    return 'ลบลายนิ้วมือสำเร็จ!'
  }

  async createFingerprint (body: UserFingerprintType) {
    const bioId = `BID-${uuidv4()}`


    await this.prisma.userBiometrics.create({
      data: {
        id: bioId,
        userId: body.userId,
        featureData: Buffer.from(body.featureData, 'base64'),
        description: body.description,
        createdAt: getDateFormat(new Date())
      }
    })

    return 'เพิ่มลายนิ้วมือสำเร็จ!'
  }
}
