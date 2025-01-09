import { Channel, connect } from 'amqplib'
import { OrderQueType } from 'src/types/global'

let channel: Channel

const initRabbitMq = async (): Promise<void> => {
  try {
    const conn = await connect(String(process.env.RABBITMQ))
    channel = await conn.createChannel()
  } catch (err) {
    throw err
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
    throw error
  }
}

const cancelQueue = async (queue: string): Promise<void> => {
  try {
    await channel.purgeQueue(queue)
  } catch (err) {
    throw err
  }
}

export { sendToQue, initRabbitMq, cancelQueue }
