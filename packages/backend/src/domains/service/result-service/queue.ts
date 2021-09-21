
import {MQ_RS_COMMAND_ROUTING_KEY} from "../../../config/services/rabbitmq";
import {buildQueueMessage, publishQueueMessage, QueueMessage} from "../../../modules/message-queue";

export enum ResultServiceCommand {
    DOWNLOAD = 'download'
}

export async function emitResultServiceQueueMessage(
    command: ResultServiceCommand,
    data: Record<string,any>
) {
    const message : QueueMessage = buildQueueMessage({
        routingKey: MQ_RS_COMMAND_ROUTING_KEY,
        type: command,
        data,
        metadata: {
            token: undefined
        }
    })

    await publishQueueMessage(message);
}
