import {Channel, Connection, ConsumeMessage} from "amqplib";
import {useMessageQueue} from "./index";

export async function publishQueueMessage(routingKey: string, data: QueueMessage) {
    const text = JSON.stringify(data);

    const connection: Connection = await useMessageQueue();
    const channel : Channel = await connection.createChannel();

    await channel.assertExchange('pht', 'topic', {
        durable: true
    });

    await channel.publish('pht', routingKey, Buffer.from(text));
}

export async function subscribeQueueMessage(queue: string, cb: (channel: Channel, msg: ConsumeMessage) => void) {
    const connection : Connection = await useMessageQueue();

    const channel : Channel = await connection.createChannel();

    await channel.assertExchange('pht', 'topic', {
        durable: true,
    });

    await channel.assertQueue(queue, {
        durable: true
    });

    await channel.consume(queue,  (msg: ConsumeMessage | null) => cb(channel, msg));
}

export const PhtMainQueue = 'main';

export interface QueueMessage {
    id: string,
    type: string,
    metadata: Record<string, any>,
    data: Record<string,any>
}
