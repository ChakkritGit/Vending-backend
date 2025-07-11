import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ReportsService {
  constructor (private prisma: PrismaService) {}

  async InventoryBelow () {
    try {
      const result = await this.prisma.inventory.findMany({
        where: {
          qty: {
            lt: this.prisma.inventory.fields.min,
          },
        },
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
                      drugExpire: true,
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

      const formattedResult = result
        .filter(
          inv =>
            inv.GroupInventory.length > 0 &&
            inv.GroupInventory[0].group.drug !== null,
        )
        .map(inv => {
          const groupDrug = inv.GroupInventory[0].group.drug

          return {
            inventoryId: inv.id,
            inventoryPosition: inv.position,
            inventoryQty: inv.qty,
            inventoryMin: inv.min,
            inventoryMAX: inv.max,
            inventoryStatus: inv.status,
            drugId: groupDrug.id,
            drugName: groupDrug.drugName,
            drugUnit: groupDrug.unit,
            drugImage: groupDrug.picture,
            drugPriority: groupDrug.drugPriority,
            drugExpire: groupDrug.drugExpire,
          }
        })

      return formattedResult
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
