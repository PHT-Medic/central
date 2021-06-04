import RabbitMQ, {Channel, Connection, ConsumeMessage} from 'amqplib';
import env from "../../env";
import {v4} from "uuid";

let connection : Connection | undefined;

export async function useMessageQueue() {
    if(typeof connection !== 'undefined') {
        return connection;
    }

    connection = await RabbitMQ.connect(env.rabbitMqConnectionString);
    return connection;
}


export async function publishQueueMessage(routingKey: string, data: QueueMessage) {
    const text = JSON.stringify(data);

    const connection: Connection = await useMessageQueue();
    const channel : Channel = await connection.createChannel();

    await channel.assertExchange('pht', 'topic', {
        durable: true
    });

    await channel.publish('pht', routingKey, Buffer.from(text));
}

export async function consumeMessageQueue(routingKey: string | string[], cb: (channel: Channel, msg: ConsumeMessage) => void) {
    const connection : Connection = await useMessageQueue();

    const channel : Channel = await connection.createChannel();

    await channel.assertExchange('pht', 'topic', {
        durable: true,
    });

    const assertionQueue = await channel.assertQueue('', {
        durable: false,
        autoDelete: true
    });

    if(Array.isArray(routingKey)) {
        for(let i=0; i<routingKey.length; i++) {
            await channel.bindQueue(assertionQueue.queue, 'pht', routingKey[i]);
        }
    } else {
        await channel.bindQueue(assertionQueue.queue, 'pht', routingKey);
    }

    await channel.consume(assertionQueue.queue,  (msg: ConsumeMessage | null) => cb(channel, msg));
}

export type QueChannelHandler = (message: QueueMessage) => Promise<any>;

export async function handleMessageQueueChannel(channel: Channel, handlers: Record<string, QueChannelHandler>, msg: ConsumeMessage) {
    const json : any = JSON.parse(msg.content.toString('utf-8'));
    const queueMessage : QueueMessage | undefined = !!json ? <QueueMessage> json : undefined;

    const handler = handlers[queueMessage.type] || handlers.$any;

    return handler ? handler(queueMessage) : Promise.resolve(true);
}

export interface QueueMessage {
    id: string,
    type: string,
    metadata: Record<string, any>,
    data: Record<string,any>,
    [key: string]: any
}

export function createQueueMessageTemplate(
    type?: string,
    data: Record<string, any> = {},
    metaData: Record<string, any> = {}
) : QueueMessage {
    return {
        id: v4(),
        type,
        metadata: metaData,
        data
    }
}
