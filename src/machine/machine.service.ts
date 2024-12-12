import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Machine } from '@prisma/client';
import { getDateFormat } from 'src/utils/date.format';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MachineService {
  constructor(private prisma: PrismaService) { }

  async create(createMachineDto: Machine) {
    const { machineName, location, comment, capacity } = createMachineDto

    const machine = await this.prisma.machine.findFirst({
      where: { machineName: { equals: machineName } }
    })

    if (machine) throw new HttpException('This machine name is already in use!', HttpStatus.NOT_FOUND);

    const result = await this.prisma.machine.create({
      data: {
        id: `MAC-${uuidv4()}`,
        machineName,
        capacity,
        location,
        comment: comment,
        createdAt: getDateFormat(new Date()),
        updatedAt: getDateFormat(new Date()),
      }
    })

    return result;
  }

  async findAll() {
    const result = await this.prisma.machine.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return result;
  }

  async findOne(id: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id }
    })

    if (!machine) throw new HttpException('Machine not found!', HttpStatus.NOT_FOUND);

    return machine;
  }

  async update(id: string, updateMachineDto: Machine) {
    const { machineName, capacity, location, comment, status } = updateMachineDto

    const machine = await this.prisma.machine.findUnique({
      where: { id },
    });

    if (!machine) throw new HttpException('Machine not found!', HttpStatus.NOT_FOUND);

    const result = await this.prisma.machine.update({
      where: { id },
      data: {
        machineName,
        capacity,
        location,
        status,
        comment: comment,
        updatedAt: getDateFormat(new Date()),
      }
    })

    return result;
  }

  async remove(id: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id }
    })

    if (!machine) throw new HttpException('Machine not found!', HttpStatus.NOT_FOUND);

    await this.prisma.machine.delete({
      where: { id }
    })
    return "this machine has been deleted!";
  }
}
