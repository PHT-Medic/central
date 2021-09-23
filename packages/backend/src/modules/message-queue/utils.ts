import {QueChannelHandler, QueueMessage, QueueMessageContext} from "./types";
import {v4} from "uuid";
import {useMessageQueue} from "./index";
import {Channel, Connection, ConsumeMessage} from "amqplib";

export function buildQueueMessage(context: QueueMessageContext): QueueMessage {
    context.data ??= {};
    context.metadata ??= {};

    return {
        id: v4(),
        routingKey: context.routingKey, // this might be optional if we use another rabbitmq strategy.
        type: context.type,
        data: context.data,
        metadata: context.metadata
    }
}

export async function publishQueueMessage(data: QueueMessage) {
    const { routingKey, ...payload } = data;

    const text = JSON.stringify(payload);

    const connection: Connection = await useMessageQueue();
    const channel: Channel = await connection.createChannel();

    await channel.assertExchange('pht', 'topic', {
        durable: true
    });

    channel.publish('pht', routingKey, Buffer.from(text));
}

export async function consumeMessageQueue(routingKey: string | string[], cb: (channel: Channel, msg: ConsumeMessage) => void) {
    const connection: Connection = await useMessageQueue();

    const channel: Channel = await connection.createChannel();

    await channel.assertExchange('pht', 'topic', {
        durable: true,
    });

    const assertionQueue = await channel.assertQueue('', {
        durable: false,
        autoDelete: true
    });

    if (Array.isArray(routingKey)) {
        for (let i = 0; i < routingKey.length; i++) {
            await channel.bindQueue(assertionQueue.queue, 'pht', routingKey[i]);
        }
    } else {
        await channel.bindQueue(assertionQueue.queue, 'pht', routingKey);
    }

    await channel.consume(assertionQueue.queue, (msg: ConsumeMessage | null) => cb(channel, msg));
}

export async function handleMessageQueueChannel(channel: Channel, handlers: Record<string, QueChannelHandler>, msg: ConsumeMessage) {
    const json: any = JSON.parse(msg.content.toString('utf-8'));
    const queueMessage: QueueMessage | undefined = !!json ? json as QueueMessage : undefined;

    const handler = handlers[queueMessage.type] || handlers.$any;

    return handler ? handler(queueMessage) : Promise.resolve(true);
}
