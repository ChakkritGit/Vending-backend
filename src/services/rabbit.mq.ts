import { Logger } from '@nestjs/common'
import { Channel, Connection, connect } from 'amqplib'
import { OrderQueType } from 'src/types/global'

let channel: Channel
let connection: Connection
let logger = new Logger('SERVICE')

const initRabbitMq = async (): Promise<void> => {
  try {
    connection = await connect(String(process.env.RABBITMQ))
    connection.on('error', error => {
      logger.error('RabbitMQ connection error:', error)
    })

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed. Retrying...')
      setTimeout(initRabbitMq, 5000)
    })

    channel = await connection.createChannel()
    logger.log('RabbitMQ connected and channel created.')
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error)
    setTimeout(initRabbitMq, 5000)
  }
}

const sendToQue = async (
  order: OrderQueType | OrderQueType[],
  channelName: string,
) => {
  try {
    await channel.assertQueue(channelName, { durable: true })
    if (Array.isArray(order)) {
      order.forEach(item => {
        channel.sendToQueue(channelName, Buffer.from(JSON.stringify(item)), {
          persistent: true,
        })
      })
    } else {
      channel.sendToQueue(channelName, Buffer.from(JSON.stringify(order)), {
        persistent: true,
      })
    }
  } catch (error) {
    logger.error('Error in sendToQue:', error)
    throw error
  }
}

const cancelQueue = async (queue: string): Promise<void> => {
  try {
    await channel.purgeQueue(queue)
  } catch (err) {
    logger.error('Error in cancelQueue:', err)
    throw err
  }
}

export { sendToQue, initRabbitMq, cancelQueue }
