import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { UpdateDrugDto } from './dto/update-drug.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import * as fs from 'fs/promises'
import { Drugs } from '@prisma/client'
import { getDateFormat } from 'src/utils/date.format'
import { v4 as uuidv4 } from 'uuid'
import { parse } from 'date-fns'

@Injectable()
export class DrugsService {
  logger: Logger
  constructor (private prisma: PrismaService) {
    this.logger = new Logger('SERVICE')
  }

  private async deleteFile (filePath: string) {
    try {
      await fs.unlink(`.${filePath}`)
      this.logger.log(`🗑️  this image: [${filePath}] has been deleted!`)
    } catch (error) {
      this.logger.error(`Failed to delete file: [${filePath}]!`)
    }
  }

  async create (createDrugDto: Drugs) {
    const {
      drugCode,
      drugName,
      picture,
      unit,
      drugLot,
      drugExpire,
      drugPriority,
      weight,
      comment,
    } = createDrugDto

    const drugExits = await this.prisma.drugs.findFirst({
      where: {
        OR: [
          { drugName: { equals: drugName } },
          { drugCode: { equals: drugCode } },
        ],
      },
    })

    if (drugExits) {
      if (picture) await this.deleteFile(picture)
      throw new HttpException('ยานี้มีอยู่แล้ว!', HttpStatus.BAD_REQUEST)
    }

    try {
      const formattedDrugExpire = parse(
        String(drugExpire),
        'dd-MM-yyyy',
        new Date(),
      )

      const result = await this.prisma.drugs.create({
        data: {
          id: `DRUG-${uuidv4()}`,
          drugCode,
          drugName,
          unit,
          drugLot: drugLot,
          drugExpire: formattedDrugExpire,
          drugPriority: Number(drugPriority),
          weight: Number(weight),
          picture,
          comment,
          createdAt: getDateFormat(new Date()),
          updatedAt: getDateFormat(new Date()),
        },
      })
      return result
    } catch (error) {
      this.logger.log(error)
      if (picture) await this.deleteFile(picture)
      throw new HttpException(
        'เกิดข้อผิดพลาดขณะเพิ่มยา!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async findAll () {
    const result = await this.prisma.drugs.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return result
  }

  async getExistDrug () {
    const result = await this.prisma.group.findMany({
      select: { drugId: true },
    })
    return result
  }

  async findOne (id: string) {
    const drug = await this.prisma.drugs.findFirst({
      where: { id },
    })
    if (!drug) throw new HttpException('ไม่พบยา!', HttpStatus.NOT_FOUND)
    return drug
  }

  async update (id: string, updateDrugDto: Drugs) {
    const {
      drugCode,
      drugName,
      status,
      unit,
      drugLot,
      drugExpire,
      drugPriority,
      weight,
      picture,
      comment,
    } = updateDrugDto

    const drug = await this.prisma.drugs.findUnique({
      where: { id },
    })

    if (!drug) {
      await this.deleteFile(updateDrugDto.picture)
      throw new HttpException('ไม่พบยา!', HttpStatus.NOT_FOUND)
    }

    if (picture) {
      updateDrugDto.picture = picture
      await this.deleteFile(drug.picture)
    }

    try {
      const formattedDrugExpire = parse(
        String(drugExpire),
        'dd-MM-yyyy',
        new Date(),
      )

      const result = await this.prisma.drugs.update({
        where: { id },
        data: {
          picture: picture,
          drugCode,
          drugName,
          unit,
          weight: Number(weight),
          drugLot: drugLot,
          drugExpire: formattedDrugExpire,
          drugPriority: Number(drugPriority),
          status: String(status) === 'true' ? true : false,
          comment: comment,
          updatedAt: getDateFormat(new Date()),
        },
      })

      // await this.deleteFile(drug.picture)

      return result
    } catch (error) {
      if (picture) await this.deleteFile(picture)
      console.error(error)
      throw new HttpException(
        'เกิดข้อผิดพลาดขณะแก้ไขยา!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async remove (id: string) {
    const drug = await this.prisma.drugs.findFirst({
      where: { id },
    })

    if (!drug) throw new HttpException('ไม่พบยา!', HttpStatus.NOT_FOUND)

    const result = await this.prisma.drugs.delete({
      where: { id },
    })

    await this.deleteFile(result.picture)
    return 'ยาถูกลบแล้ว!'
  }
}
