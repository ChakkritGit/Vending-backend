import axios, { AxiosError } from 'axios'
import { Injectable, NotFoundException } from '@nestjs/common'
import { Prescription, ResponsePres } from 'src/types/global'
import { Orders } from '@prisma/client'
import { getDateFormat } from 'src/utils/date.format'
import { PrismaService } from 'src/prisma/prisma.service'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class DispenseService {
  constructor (private prisma: PrismaService) {}

  async getPharmacyPres (id: string) {
    try {
      const response = await axios.get<ResponsePres>(
        `${process.env.PHARMACY_HOST}/getPresTest/${id}`,
      )
      return response.data.data
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new NotFoundException('Data not found')
        }
      }
      throw error
    }
  }

  async createPresAndOrder (presData: Prescription) {
    const order: Orders[] = presData.Prescription.map(item => {
      return {
        id: `ORD-${item.RowID}`,
        prescriptionId: item.f_prescriptionno,
        drugId: item.f_orderitemcode,
        drugName: item.f_orderitemname,
        qty: Number(item.f_orderqty),
        unit: item.f_orderunitcode,
        position: item.f_binlocation,
        status: '0',
        machineId: 'MAC-1e77a4fd-1f2c-4c0c-bcb8-11517839adfa',
        comment: '',
        createdAt: getDateFormat(new Date()),
        updatedAt: getDateFormat(new Date()),
      }
    })

    const pres = {
      prescriptionNo: presData.PrescriptionNo,
      hn: presData.HN,
      patientName: presData.PatientName,
      prescription: order,
    }

    await this.prisma.$transaction([
      this.prisma.prescriptions.create({
        data: {
          id: presData.PrescriptionNo,
          hn: presData.HN,
          patientName: presData.PatientName,
          status: '0',
          createdAt: getDateFormat(new Date()),
          updatedAt: getDateFormat(new Date()),
        },
      }),
      this.prisma.orders.createMany({ data: order }),
    ])

    return pres
  }

  async dispense (id: string) {
    return ''
  }
}
