import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) { }

  create(createPrescriptionDto: CreatePrescriptionDto) {
    return 'This action adds a new prescription';
  }

  async findAll() {
    const result = await this.prisma.prescriptions.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return result;
  }

  async findOne(id: string) {
    const prescription = await this.prisma.prescriptions.findFirst({
      where: { id }
    })

    if (!prescription) throw new HttpException('this prescription is not found!', HttpStatus.NOT_FOUND)

    return prescription;
  }

  update(id: number, updatePrescriptionDto: UpdatePrescriptionDto) {
    return `This action updates a #${id} prescription`;
  }

  async remove(id: string) {
    const prescription = await this.prisma.prescriptions.findFirst({
      where: { id }
    })

    if (!prescription) throw new HttpException('this prescription is not found!', HttpStatus.NOT_FOUND)

    await this.prisma.prescriptions.delete({
      where: { id }
    })
    return "this prescription has been deleted!";
  }
}
