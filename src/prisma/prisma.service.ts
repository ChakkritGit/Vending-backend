import {
  Injectable,
  Logger,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

const logger = new Logger('PrismaService')

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  private isRetrying = false

  async onModuleInit (): Promise<void> {
    try {
      await this.$connect()
      logger.log('Database connected successfully.')
      this.isRetrying = false
    } catch (error) {
      logger.error('Database connection error:', error)
      if (!this.isRetrying) {
        this.isRetrying = true
        logger.warn('Database re-connection in 5 seconds...')
        setTimeout(() => this.onModuleInit(), 5000)
      }
    }
  }

  async onApplicationShutdown (signal?: string): Promise<void> {
    logger.warn(
      `Application is shutting down (${signal}). Disconnecting Database.`,
    )
    await this.$disconnect()
  }
}
