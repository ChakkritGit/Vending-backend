import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Inventory } from '@prisma/client';
import { getDateFormat } from 'src/utils/date.format';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) { }

  async create(createInventoryDto: Inventory) {
    const { position, qty, min, max, drugId, machineId, comment } = createInventoryDto

    const inventory = await this.prisma.inventory.findFirst({
      where: { position }
    })

    if (inventory) throw new HttpException('ตำแหน่งนี้ถูกใช้ไปแล้ว!', HttpStatus.BAD_REQUEST);

    const result = await this.prisma.inventory.create({
      data: {
        id: `INV-${uuidv4()}`,
        position,
        qty,
        min,
        max,
        drugId,
        machineId,
        comment,
        createdAt: getDateFormat(new Date()),
        updatedAt: getDateFormat(new Date()),
      }
    })

    return result;
  }

  async findAll() {
    const result = await this.prisma.inventory.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return result;
  }

  async findOne(id: string) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id }
    })

    if (!inventory) throw new HttpException('ไม่พบช่องสินค้า!', HttpStatus.NOT_FOUND);

    return inventory;
  }

  async update(id: string, updateInventoryDto: Inventory) {
    const { position, qty, min, max, drugId, machineId, status, comment } = updateInventoryDto
    const inventory = await this.prisma.inventory.findFirst({
      where: { id }
    })

    if (!inventory) throw new HttpException('ไม่พบช่องสินค้า!', HttpStatus.NOT_FOUND);

    const result = await this.prisma.inventory.update({
      where: {id},
      data: {
        position,
        qty,
        min,
        max,
        drugId,
        machineId,
        status,
        comment,
        updatedAt: getDateFormat(new Date()),
      }
    })

    return result;
  }

  async remove(id: string) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id }
    })

    if (!inventory) throw new HttpException('ไม่พบช่องสินค้า!', HttpStatus.NOT_FOUND);

    await this.prisma.inventory.delete({
      where: { id }
    })

    return "ช่องสินค้าถูกลบแล้ว!";
  }
}
