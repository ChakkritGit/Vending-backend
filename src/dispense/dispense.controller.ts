import { Controller, Get, Param } from '@nestjs/common'
import { DispenseService } from './dispense.service'
import { sendToQue } from 'src/services/rabbit.mq'
import { OrderQueType } from 'src/types/global'

@Controller('dispense')
export class DispenseController {
  constructor (private readonly dispenseService: DispenseService) {}

  @Get(':id')
  async dispense (@Param('id') id: string) {
    const response = await this.dispenseService.getPharmacyPres(id)
    const result = await this.dispenseService.createPresAndOrder(response)
    const que: OrderQueType[] = result.order.map((item) => {
      return { id: item.id, qty: item.qty, position: Number(item.position) }
    })
    await sendToQue(que, 'vdOrder')
    return result
  }
}
