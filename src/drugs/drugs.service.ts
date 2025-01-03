import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateDrugDto } from './dto/update-drug.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs/promises';
import { Drugs } from '@prisma/client';
import { getDateFormat } from 'src/utils/date.format';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DrugsService {
  constructor(private prisma: PrismaService) { }

  private async deleteFile(filePath: string) {
    try {
      await fs.unlink(`.${filePath}`);
      console.log(`🗑️  this image: [${filePath}] has been deleted!`)
    } catch (error) {
      console.error(`Failed to delete file: [${filePath}]!`);
    }
  }

  async create(createDrugDto: Drugs) {
    const { drugName, picture, unit, weight, comment } = createDrugDto;

    const drugExits = await this.prisma.drugs.findFirst({
      where: { drugName: { equals: drugName } },
    });

    if (drugExits) {
      if (picture) await this.deleteFile(picture);
      throw new HttpException('This drug name is already in use!', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.prisma.drugs.create({
        data: {
          id: `DRUG-${uuidv4()}`,
          drugName,
          unit,
          weight: Number(weight),
          picture,
          comment,
          createdAt: getDateFormat(new Date()),
          updatedAt: getDateFormat(new Date())
        }
      })
      return result;
    } catch (error) {
      console.log("passed2")
      console.log(error)
      if (picture) await this.deleteFile(picture);
      throw new HttpException(
        'An error occurred while creating the drug!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const result = await this.prisma.drugs.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return result;
  }

  async findOne(id: string) {
    const drug = await this.prisma.drugs.findFirst({
      where: { id }
    })
    if (!drug) throw new HttpException('Drug not found!', HttpStatus.NOT_FOUND);
    return drug;
  }

  async update(id: string, updateDrugDto: Drugs) {
    const { drugName, status, unit, weight, picture, comment } = updateDrugDto
    const drug = await this.prisma.drugs.findUnique({
      where: { id },
    });

    if (!drug) {
      await this.deleteFile(updateDrugDto.picture);
      throw new HttpException('Drug not found!', HttpStatus.NOT_FOUND);
    }

    const result = await this.prisma.drugs.update({
      where: { id },
      data: {
        drugName,
        unit,
        picture: picture,
        weight: Number(weight),
        status: String(status) === "0" ? false : true,
        comment: comment,
        updatedAt: getDateFormat(new Date()),
      }
    })

    await this.deleteFile(drug.picture);

    return result;
  }

  async remove(id: string) {
    const drug = await this.prisma.drugs.findFirst({
      where: { id }
    })
    if (!drug) throw new HttpException('Drug not found!', HttpStatus.NOT_FOUND);
    const result = await this.prisma.drugs.delete({
      where: { id }
    })
    await this.deleteFile(result.picture);
    return "this drug has been deleted!";
  }
}
