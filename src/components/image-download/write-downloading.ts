import {buildMessage, Message, publishMessage} from "amqp-extension";
import {MessageQueueSelfToUIRoutingKey} from "../../config/services/rabbitmq";
import {TrainResultEvent} from "../../domains/train-result/type";

export async function writeDownloadingEvent(message: Message) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT
        },
        type: TrainResultEvent.DOWNLOADING,
        data: message.data,
        metadata: message.metadata
    }))

    return message;
}
