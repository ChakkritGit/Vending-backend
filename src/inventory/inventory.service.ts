import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Inventory } from '@prisma/client'
import { getDateFormat } from 'src/utils/date.format'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class InventoryService {
  constructor (private prisma: PrismaService) {}

  async create (createInventoryDto: Inventory) {
    const { position, min, max, machineId, comment } = createInventoryDto

    const inventory = await this.prisma.inventory.findFirst({
      where: { position },
    })

    if (inventory)
      throw new HttpException('ตำแหน่งนี้ถูกใช้ไปแล้ว!', HttpStatus.BAD_REQUEST)
    const result = await this.prisma.inventory.create({
      data: {
        id: `INV-${uuidv4()}`,
        position,
        qty: 0,
        min,
        max,
        machineId,
        comment,
        createdAt: getDateFormat(new Date()),
        updatedAt: getDateFormat(new Date()),
      },
    })

    return result
  }

  async findAll () {
    const result = await this.prisma.inventory.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return result
  }

  async getExistInventory () {
    const result = await this.prisma.groupInventory.findMany({
      select: { inventoryId: true },
    })
    return result
  }

  async findOne (id: string) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id },
    })

    if (!inventory)
      throw new HttpException('ไม่พบช่องสินค้า!', HttpStatus.NOT_FOUND)

    return inventory
  }

  async update (id: string, updateInventoryDto: Inventory) {
    const { position, qty, min, max, machineId, status, comment } =
      updateInventoryDto
    const inventory = await this.prisma.inventory.findFirst({
      where: { id },
    })

    if (!inventory)
      throw new HttpException('ไม่พบช่องสินค้า!', HttpStatus.NOT_FOUND)

    const result = await this.prisma.inventory.update({
      where: { id },
      data: {
        position,
        qty,
        min,
        max,
        machineId,
        status,
        comment,
        updatedAt: getDateFormat(new Date()),
      },
    })

    return result
  }

  async remove (id: string) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id },
    })

    if (!inventory) {
      throw new HttpException('ไม่พบช่องสินค้า!', HttpStatus.NOT_FOUND)
    }

    try {
      const result = await this.prisma.inventory.deleteMany({
        where: { id },
      })

      if (result.count > 0) {
        return 'ช่องสินค้าถูกลบแล้ว!'
      }
    } catch (error) {
      throw new HttpException(
        'ไม่สามารถลบช่องได้ กรุณาตรวจสอบการจัดกรุ๊ปหรือข้อมูลที่เชื่อมโยง!',
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
