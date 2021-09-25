import {buildMessage, Message, publishMessage} from "amqp-extension";
import {MessageQueueSelfToUIRoutingKey} from "../../config/services/rabbitmq";
import {TrainResultStatus, TrainResultStep} from "../../domains/train-result/type";

export async function writeExtractingFailedEvent(message: Message, error: Error) {

    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT
        },
        type: TrainResultStatus.FAILED,
        data: {
            ...message.data,
            error: {
                message: error.message,
                step: TrainResultStep.EXTRACT
            }
        },
        metadata: message.metadata
    }))

    return message;
}
