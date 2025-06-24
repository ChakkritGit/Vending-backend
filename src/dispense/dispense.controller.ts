import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Param,
} from '@nestjs/common'
import { DispenseService } from './dispense.service'
import { sendToQue } from 'src/services/rabbit.mq'
import { OrderQueType } from 'src/types/global'

@Controller('dispense')
export class DispenseController {
  constructor(private readonly dispenseService: DispenseService) { }

  @Get(':id')
  async dispense(@Param('id') id: string) {
    const readyToDispense = await this.dispenseService.findPrescription()
    if (!!readyToDispense)
      throw new BadRequestException('รายการนี้กำลังถูกจัดอยู่!')
    // const response = await this.dispenseService.getPharmacyPres(id)
    const response = {
      "RFID": "7",
      "PrescriptionNo": "00001",
      "HN": "TEST01",
      "PatientName": "ทดสอบ ระบบ 01",
      "Prescription": [
        {
          "f_prescriptionno": "00001",
          "f_prescriptiondate": "20230508",
          "f_hn": "TEST01",
          "f_an": "TEST01",
          "f_patientname": "ทดสอบ ระบบ 01",
          "f_wardcode": "W01",
          "f_warddesc": "WARD 01",
          "f_prioritycode": "C",
          "f_prioritydesc": "Con",
          "f_orderitemcode": "AIRT120",
          "f_orderitemname": "AIR X TAB. *** 120 MG",
          "f_orderqty": "3",
          "f_orderunitcode": "TAB",
          "Machine": "ADD",
          "command": "B0112D0003S1D4321",
          "f_binlocation": "12",
          "RowID": "8BD48732-E011-420D-B307-8891EF718C0B"
        },
        {
          "f_prescriptionno": "00001",
          "f_prescriptiondate": "20230508",
          "f_hn": "TEST01",
          "f_an": "TEST01",
          "f_patientname": "ทดสอบ ระบบ 01",
          "f_wardcode": "W01",
          "f_warddesc": "WARD 01",
          "f_prioritycode": "C",
          "f_prioritydesc": "Con",
          "f_orderitemcode": "ATOTT40",
          "f_orderitemname": "ATORVASTATIN TAB 40 MG (TOVASTIN)",
          "f_orderqty": "1",
          "f_orderunitcode": "TAB",
          "Machine": "ADD",
          "command": "B0123D0001S1D4321",
          "f_binlocation": "23",
          "RowID": "DED7795B-3989-4C97-B8E0-230B0071BF73"
        },
        {
          "f_prescriptionno": "00001",
          "f_prescriptiondate": "20230508",
          "f_hn": "TEST01",
          "f_an": "TEST01",
          "f_patientname": "ทดสอบ ระบบ 01",
          "f_wardcode": "W01",
          "f_warddesc": "WARD 01",
          "f_prioritycode": "C",
          "f_prioritydesc": "Con",
          "f_orderitemcode": "CALT1",
          "f_orderitemname": "CALTAB TAB. 1,000 MG",
          "f_orderqty": "1",
          "f_orderunitcode": "TAB",
          "Machine": "ADD",
          "command": "B0141D0001S1D4321",
          "f_binlocation": "41",
          "RowID": "069B5250-229A-49B8-BDD8-A2B48A1167CC"
        }
      ]
    }
    const finished = await this.dispenseService.findPrescriptionFinished(response.PrescriptionNo)
    if (finished) throw new BadRequestException('รายการนี้ถูกจัดแล้ว!')
    const result = await this.dispenseService.createPresAndOrder(response)
    const que: OrderQueType[] = result.order
      .map(item => {
        return {
          id: item.id,
          presId: item.prescriptionId,
          qty: item.qty,
          position: item.position,
          priority: item.drugPriority
        }
      })
      .sort((a, b) => a.position - b.position)
    await sendToQue(que, 'vdOrder')
    return result
  }

  @Get('order/status/pending/:id/:presId')
  async updateOrderPendingStatus(
    @Param('id') id: string,
    @Param('presId') presId: string,
  ) {
    const result = await this.dispenseService.updateStatusOrder(
      id,
      'pending',
      presId,
    )
    return result
  }

  @Get('order/status/receive/:id/:presId')
  async updateOrderReceiveStatus(
    @Param('id') id: string,
    @Param('presId') presId: string,
  ) {
    const result = await this.dispenseService.updateStatusOrder(
      id,
      'receive',
      presId,
    )
    return result
  }

  @Get('order/status/complete/:id/:presId')
  async updateOrderCompleteStatus(
    @Param('id') id: string,
    @Param('presId') presId: string,
  ) {
    const result = await this.dispenseService.updateStatusOrder(
      id,
      'complete',
      presId,
    )
    return result
  }

  @Get('order/status/error/:id/:presId')
  async updateOrderErrorStatus(
    @Param('id') id: string,
    @Param('presId') presId: string,
  ) {
    const result = await this.dispenseService.updateStatusOrder(
      id,
      'error',
      presId,
    )
    return result
  }

  @Get('order/status/ready/:id/:presId')
  async updateOrderReadyStatus(
    @Param('id') id: string,
    @Param('presId') presId: string,
  ) {
    const result = await this.dispenseService.updateStatusOrder(
      id,
      'ready',
      presId,
    )
    return result
  }

  @Get('prescription/order')
  async getOrder() {
    const result = await this.dispenseService.getOrder()
    return result
  }

  @Get('prescription/order/clear')
  async clearPresOrder() {
    const result = await this.dispenseService.clearPresOrder()
    return result
  }
}
