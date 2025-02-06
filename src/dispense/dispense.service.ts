import axios, { AxiosError } from 'axios'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common'
import { Prescription, ResponsePres } from 'src/types/global'
import { Orders } from '@prisma/client'
import { getDateFormat } from 'src/utils/date.format'
import { PrismaService } from 'src/prisma/prisma.service'
import { cancelQueue } from 'src/services/rabbit.mq'

@Injectable()
export class DispenseService {
  constructor (private prisma: PrismaService) {}

  async findPrescription () {
    try {
      const result = await this.prisma.prescriptions.findFirst({
        where: { status: { in: ['ready', 'pending'] } },
        include: { order: true },
        orderBy: { createdAt: 'asc' },
      })
      return result
    } catch (error) {
      throw error
    }
  }

  async findPrescriptionFinished (id: string) {
    try {
      const result = await this.prisma.prescriptions.findFirst({
        where: { id, AND: { status: { equals: 'complete' } } },
      })
      return result
    } catch (error) {
      throw error
    }
  }

  async getPharmacyPres (id: string) {
    try {
      const response = await axios.get<ResponsePres>(
        `${process.env.PHARMACY_HOST}/getPresTest/${id}`,
      )
      return response.data.data
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new NotFoundException('ไม่พบใบสั่งยา!')
        } else if (error.response?.status === 502) {
          throw new NotFoundException(
            'Unable to connect to the service server!',
          )
        }
      }
      throw error
    }
  }

  async createPresAndOrder (presData: Prescription) {
    try {
      const drugs = await this.prisma.drugs.findMany()

      const order: Orders[] = presData.Prescription.map(item => {
        const matchedDrug = drugs.find(
          drug => drug.drugCode === item.f_orderitemcode,
        )

        if (!matchedDrug) {
          throw new Error(`Drug with code ${item.f_orderitemcode} not found.`)
        }

        return {
          id: `ORD-${item.RowID}`,
          prescriptionId: item.f_prescriptionno,
          drugId: item.f_orderitemcode,
          drugName: matchedDrug.drugName,
          qty: parseInt(item.f_orderqty),
          unit: matchedDrug.unit,
          drugLot: matchedDrug.drugLot,
          drugExpire: matchedDrug.drugExpire,
          drugPriority: matchedDrug.drugPriority,
          position: parseInt(item.f_binlocation),
          status: 'ready',
          machineId: 'MAC-241ab4ad-201f-40fd-aa88-aec1512ae15c',
          comment: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }).sort((a, b) => a.position - b.position)

      const result = await this.prisma.$transaction(async tx => {
        await tx.prescriptions.create({
          data: {
            id: presData.PrescriptionNo,
            hn: presData.HN,
            patientName: presData.PatientName,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })

        await tx.orders.createMany({ data: order })

        return tx.prescriptions.findFirst({
          where: { status: { equals: 'pending' } },
          include: {
            order: {
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      })

      return result
    } catch (error) {
      console.error('Error creating prescription and order:', error)
      throw new Error('Failed to create prescription and orders.')
    }
  }

  async updateStatusOrder (id: string, status: string, presId: string) {
    const order = await this.prisma.orders.findUnique({ where: { id } })

    if (!order) throw new NotFoundException('ไม่พบรายการ!')

    const validStatusTransitions = {
      pending: 'ready',
      receive: 'pending',
      complete: 'receive',
      error: 'pending',
      ready: 'pending',
    }

    if (order.status !== validStatusTransitions[status]) {
      if (status === 'error' && order.status === 'pending') {
        throw new BadRequestException(
          'รายการอยู่ระหว่างดำเนินการและยังไม่ได้อยู่ในสถานะรับ!',
        )
      }

      throw new BadRequestException(
        `ไม่สามารถเปลี่ยนสถานะจาก ${order.status} ไปเป็น ${status} ได้`,
      )
    }

    await this.prisma.orders.update({
      where: { id },
      data: { status, updatedAt: getDateFormat(new Date()) },
    })

    if (status === 'error') return

    const relatedOrders = await this.prisma.orders.findMany({
      where: { prescriptionId: presId },
      select: { status: true },
    })

    const allCompletedOrErrored = relatedOrders.every(
      o => o.status === 'complete' || o.status === 'error',
    )

    if (allCompletedOrErrored) {
      await this.prisma.prescriptions.update({
        where: { id: presId },
        data: { status: 'complete', updatedAt: getDateFormat(new Date()) },
      })
    }

    const result = await this.prisma.prescriptions.findFirst({
      where: {
        id: presId,
        AND: { order: { every: { status: { contains: 'complete' } } } },
      },
      include: { order: true },
    })

    return result
  }

  async getOrder () {
    const result = await this.prisma.prescriptions.findFirst({
      where: { status: { equals: 'pending' } },
      include: {
        order: {
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!result) return

    return result
  }

  async clearPresOrder () {
    await this.prisma.$transaction([
      this.prisma.orders.deleteMany(),
      this.prisma.prescriptions.deleteMany(),
    ])
    await cancelQueue('vdOrder')
    return 'Successfully'
  }
}
