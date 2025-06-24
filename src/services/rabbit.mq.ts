import { Logger } from '@nestjs/common'
import * as amqplib from 'amqplib'
import { Channel, Connection } from 'amqplib'
import { OrderQueType } from 'src/types/global'

export class RabbitMQService {
  private static instance: RabbitMQService
  private connection: Connection | null = null
  private channel: Channel | null = null
  private readonly logger = new Logger('RabbitMQService')
  private readonly retryDelay = 5000

  private constructor() {}

  public static getInstance(): RabbitMQService {
    if (!RabbitMQService.instance) {
      RabbitMQService.instance = new RabbitMQService()
    }
    return RabbitMQService.instance
  }

  public async init(): Promise<void> {
    const url = process.env.RABBITMQ ?? 'amqp://localhost'
    try {
      this.logger.log(`🔌 Connecting to RabbitMQ: ${url}`)
      this.connection = await amqplib.connect(url)

      this.connection.on('error', (error) => {
        this.logger.error('RabbitMQ connection error:', error)
      })

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed. Retrying...')
        setTimeout(() => this.init(), this.retryDelay)
      })

      this.channel = await this.connection.createChannel()
      this.logger.log('✅ RabbitMQ connected and channel created.')
    } catch (error) {
      this.logger.error('❌ Failed to connect to RabbitMQ:', error)
      setTimeout(() => this.init(), this.retryDelay)
    }
  }

  public async sendToQueue(order: OrderQueType | OrderQueType[], queueName: string): Promise<void> {
    if (!this.channel) {
      this.logger.error('❌ Channel is not initialized.')
      return
    }

    try {
      await this.channel.assertQueue(queueName, { durable: true })
      const orders = Array.isArray(order) ? order : [order]
      for (const item of orders) {
        this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(item)), {
          persistent: true,
        })
      }
    } catch (error) {
      this.logger.error('❌ Error in sendToQueue:', error)
      throw error
    }
  }

  public async cancelQueue(queueName: string): Promise<void> {
    if (!this.channel) {
      this.logger.error('❌ Channel is not initialized.')
      return
    }

    try {
      await this.channel.purgeQueue(queueName)
    } catch (error) {
      this.logger.error('❌ Error in cancelQueue:', error)
      throw error
    }
  }
}
