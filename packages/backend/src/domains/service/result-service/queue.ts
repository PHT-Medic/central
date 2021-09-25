import {buildMessage, publishMessage} from "amqp-extension";
import {MQ_RS_COMMAND_ROUTING_KEY} from "../../../config/services/rabbitmq";

export enum ResultServiceCommand {
    DOWNLOAD = 'download'
}

export async function emitResultServiceQueueMessage(
    command: ResultServiceCommand,
    data: Record<string,any>
) {
    const message = buildMessage({
        options: {
            routingKey: MQ_RS_COMMAND_ROUTING_KEY
        },
        type: command,
        data,
        metadata: {
            token: undefined
        }
    })

    await publishMessage(message);
}
