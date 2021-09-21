export interface QueueMessage {
    id: string,
    type: string,
    routingKey?: string,
    metadata: Record<string, any>,
    data: Record<string, any>,

    [key: string]: any
}

export type QueueMessageContext = {
    routingKey: string,
    type?: string;
    data?: Record<string, any>;
    metadata?: Record<string, any>;
}

export type QueChannelHandler = (message: QueueMessage) => Promise<any>;
