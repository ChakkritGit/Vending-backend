import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { UpdateDrugDto } from './dto/update-drug.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import * as fs from 'fs/promises'
import { Drugs } from '@prisma/client'
import { getDateFormat } from 'src/utils/date.format'
import { v4 as uuidv4 } from 'uuid'

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
    const { drugCode, drugName, picture, unit, weight, comment } = createDrugDto

    const drugExits = await this.prisma.drugs.findFirst({
      where: { drugName: { equals: drugName } },
    })

    if (drugExits) {
      if (picture) await this.deleteFile(picture)
      throw new HttpException(
        'This drug name is already in use!',
        HttpStatus.BAD_REQUEST,
      )
    }

    try {
      const result = await this.prisma.drugs.create({
        data: {
          id: `DRUG-${uuidv4()}`,
          drugCode,
          drugName,
          unit,
          weight: Number(weight),
          picture,
          comment,
          createdAt: getDateFormat(new Date()),
          updatedAt: getDateFormat(new Date()),
        },
      })
      return result
    } catch (error) {
      this.logger.log('passed2')
      this.logger.log(error)
      if (picture) await this.deleteFile(picture)
      throw new HttpException(
        'An error occurred while creating the drug!',
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

  async findOne (id: string) {
    const drug = await this.prisma.drugs.findFirst({
      where: { id },
    })
    if (!drug) throw new HttpException('Drug not found!', HttpStatus.NOT_FOUND)
    return drug
  }

  async update (id: string, updateDrugDto: Drugs) {
    const { drugName, status, unit, weight, picture, comment } = updateDrugDto
    const drug = await this.prisma.drugs.findUnique({
      where: { drugCode: id },
    })

    if (!drug) {
      await this.deleteFile(updateDrugDto.picture)
      throw new HttpException('Drug not found!', HttpStatus.NOT_FOUND)
    }

    const result = await this.prisma.drugs.update({
      where: { drugCode: id },
      data: {
        drugName,
        unit,
        picture: picture,
        weight: Number(weight),
        status: String(status) === '0' ? false : true,
        comment: comment,
        updatedAt: getDateFormat(new Date()),
      },
    })

    await this.deleteFile(drug.picture)

    return result
  }

  async remove (id: string) {
    const drug = await this.prisma.drugs.findFirst({
      where: { id },
    })
    if (!drug) throw new HttpException('Drug not found!', HttpStatus.NOT_FOUND)
    const result = await this.prisma.drugs.delete({
      where: { drugCode: id },
    })
    await this.deleteFile(result.picture)
    return 'this drug has been deleted!'
  }
}
