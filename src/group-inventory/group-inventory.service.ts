import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateGroupInventoryDto } from './dto/create-group-inventory.dto'
import { UpdateGroupInventoryDto } from './dto/update-group-inventory.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { GroupInventory } from '@prisma/client'
import {
  GroupType,
  InventoryGroupType,
  RawQueryInventoryGroupType,
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

  findOne (id: number) {
    return `This action returns a #${id} groupInventory`
  }

  update (id: number, updateGroupInventoryDto: UpdateGroupInventoryDto) {
    return `This action updates a #${id} groupInventory`
  }

  remove (id: number) {
    return `This action removes a #${id} groupInventory`
  }
}
