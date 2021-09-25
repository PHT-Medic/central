import {buildMessage, Message, publishMessage} from "amqp-extension";
import {MessageQueueSelfToUIRoutingKey} from "../../config/services/rabbitmq";
import {TrainResultEvent, TrainResultStep} from "../../domains/train-result/type";

export async function writeDownloadingFailedEvent(message: Message, error: Error) {

    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT
        },
        type: TrainResultEvent.FAILED,
        data: {
            ...message.data,
            error: {
                message: error.message,
                step: TrainResultStep.DOWNLOAD
            }
        },
        metadata: message.metadata
    }))

    return message;
}
