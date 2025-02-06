import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateGroupInventoryDto } from './dto/create-group-inventory.dto'
import { UpdateGroupInventoryDto } from './dto/update-group-inventory.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { GroupInventory } from '@prisma/client'
import {
  GroupInventoryUpdateType,
  GroupType,
  InventoryGroupType,
  RawQueryInventoryGroupType,
  StockUpdateType,
} from 'src/types/groupInventoryType'
const { v4: uuidv4 } = require('uuid')

@Injectable()
export class GroupInventoryService {
  constructor (private prisma: PrismaService) {}

  async create (body: GroupType) {
    const { drugId, inventories, groupMin, groupMax } = body
    try {
      const groupId = `GROUP-${uuidv4()}`

      const result = await this.prisma.$transaction(async db => {
        const existingDrug = await db.group.findMany({
          where: { drugId: drugId },
        })

        if (existingDrug.length === 0) {
          await db.group.create({
            data: {
              id: groupId,
              drugId: drugId,
              inventoryId: inventories[0].inventoryId,
              groupStatus: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          })

          for (const inventory of inventories) {
            const inventoryId = inventory.inventoryId

            await db.groupInventory.create({
              data: {
                id: `GROUPINV-${uuidv4()}`,
                groupId: groupId,
                inventoryId: inventoryId,
                min: groupMin,
                max: groupMax,
              },
            })
          }

          return true
        } else {
          return false
        }
      })

      if (result) {
        return 'กรุ๊ปและข้อมูลสต๊อกถูกเพิ่มสำเร็จ'
      } else {
        throw new HttpException(
          'ไม่สามารถเพิ่มกรุ๊ปได้เนื่องจากยาถูกจัดในกรุ๊ปอื่นแล้ว',
          HttpStatus.BAD_REQUEST,
        )
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async findAll () {
    try {
      const groups: InventoryGroupType[] = []

      const result: RawQueryInventoryGroupType[] = await this.prisma.$queryRaw`
      SELECT
          g.id as groupId,
          g."drugId" as drugId,
          d."drugName" as drugName,
          d.picture as drugImage,
          d."drugPriority" as drugPriority,
          d.unit as drugUnit,
          gi."inventoryId" as inventoryId,
          gi.min as groupMin,
          gi.max as groupMax,
          i.position as inventoryPosition,
          i.qty as inventoryQty
        FROM "Group" g
        INNER JOIN "GroupInventory" gi ON g.id = gi."groupId"
        INNER JOIN "Inventory" i ON gi."inventoryId" = i.id
        INNER JOIN "Drugs" d ON g."drugId" = d.id
        ORDER BY g.id DESC, i.position ASC
    `

      if (result && result.length > 0) {
        result.forEach(item => {
          const existingGroup = groups.find(
            filter => filter.groupid === item.groupid,
          )

          if (existingGroup) {
            existingGroup.inventoryList.push({
              inventoryId: item.inventoryid,
              inventoryPosition: item.inventoryposition,
              inventoryQty: item.inventoryqty,
            })
          } else {
            groups.push({
              groupid: item.groupid,
              drugid: item.drugid,
              drugname: item.drugname,
              drugimage: item.drugimage,
              drugpriority: item.drugpriority,
              drugunit: item.drugunit,
              groupmin: item.groupmin,
              groupmax: item.groupmax,
              inventoryList: [
                {
                  inventoryId: item.inventoryid,
                  inventoryPosition: item.inventoryposition,
                  inventoryQty: item.inventoryqty,
                },
              ],
            })
          }
        })
      } else {
        return []
      }

      return groups
    } catch (error) {
      console.error('Error fetching groups:', error)
      throw error
    }
  }

  async updateGroupAndInventory (id: string, body: GroupInventoryUpdateType) {
    const { drugId, groupMax, groupMin, inventories } = body
    try {
      return this.prisma.$transaction(async prisma => {
        const existingDrug = await prisma.group.findFirst({
          where: {
            drugId: drugId,
            id: { not: id },
          },
        })

        if (existingDrug) {
          throw new Error(
            'ไม่สามารถอัปเดตกรุ๊ปได้เนื่องจากยาถูกจัดในกลุ่มอื่นแล้ว',
          )
        }

        await prisma.group.update({
          where: { id: id },
          data: {
            drugId,
            updatedAt: new Date(),
          },
        })

        const currentInventories = await prisma.groupInventory.findMany({
          where: { groupId: id },
        })

        const currentInventoryIds = currentInventories.map(
          inv => inv.inventoryId,
        )
        const newInventoryIds = inventories.map(inv => inv.inventoryId)

        const inventoriesToRemove = currentInventoryIds.filter(
          id => !newInventoryIds.includes(id),
        )
        await prisma.groupInventory.deleteMany({
          where: {
            inventoryId: { in: inventoriesToRemove },
            groupId: id,
          },
        })

        for (const inventory of inventories) {
          const existInvInGroup = await prisma.groupInventory.findFirst({
            where: { inventoryId: inventory.inventoryId, groupId: id },
          })

          if (!existInvInGroup) {
            await prisma.groupInventory.create({
              data: {
                id: `GROUPINV-${uuidv4()}`,
                groupId: id,
                inventoryId: inventory.inventoryId,
                min: groupMin,
                max: groupMax,
              },
            })
          } else {
            await prisma.groupInventory.update({
              where: {
                id: existInvInGroup.id,
              },
              data: {
                min: groupMin,
                max: groupMax,
              },
            })
          }
        }

        return 'กรุ๊ปและข้อมูลสต๊อกถูกแก้ไขสำเร็จ'
      })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteGroup (id: string) {
    try {
      return await this.prisma.$transaction(async prisma => {
        await prisma.groupInventory.deleteMany({
          where: { groupId: id },
        })

        await prisma.group.delete({
          where: { id: id },
        })

        return 'ลบกรุ๊ปสำเร็จ'
      })
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getInventoryWithDrug () {
    try {
      const result = await this.prisma.inventory.findMany({
        select: {
          id: true,
          position: true,
          qty: true,
          min: true,
          max: true,
          status: true,
          GroupInventory: {
            select: {
              group: {
                select: {
                  drug: {
                    select: {
                      id: true,
                      drugName: true,
                      unit: true,
                      picture: true,
                      drugPriority: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      })

      const formattedResult = result.map(inv => {
        const groupData =
          inv.GroupInventory.length > 0
            ? inv.GroupInventory[0].group.drug
            : null

        return {
          inventoryId: inv.id,
          inventoryPosition: inv.position,
          inventoryQty: inv.qty,
          inventoryMin: inv.min,
          inventoryMAX: inv.max,
          inventoryStatus: inv.status,
          drugId: groupData ? groupData.id : null,
          drugName: groupData ? groupData.drugName : null,
          drugUnit: groupData ? groupData.unit : null,
          drugImage: groupData ? groupData.picture : null,
          drugPriority: groupData ? groupData.drugPriority : null,
        }
      })

      return formattedResult
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateStock (id: string, body: StockUpdateType) {
    const { inventoryQty } = body
    try {
      const result = await this.prisma.inventory.update({
        where: { id },
        data: {
          qty: inventoryQty,
          updatedAt: new Date()
        },
      })
      return result
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
