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
  constructor (private readonly dispenseService: DispenseService) {}

  @Get(':id')
  async dispense (@Param('id') id: string) {
    const readyToDispense = await this.dispenseService.findPrescription()
    if (!!readyToDispense)
      throw new BadRequestException('รายการนี้กำลังถูกจัดอยู่!')
    const response = await this.dispenseService.getPharmacyPres(id)
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
  async updateOrderPendingStatus (
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
  async updateOrderReceiveStatus (
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
  async updateOrderCompleteStatus (
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
  async updateOrderErrorStatus (
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
  async updateOrderReadyStatus (
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
  async getOrder () {
    const result = await this.dispenseService.getOrder()
    return result
  }

  @Get('prescription/order/clear')
  async clearPresOrder () {
    const result = await this.dispenseService.clearPresOrder()
    return result
  }
}
