import {buildMessage, Message, publishMessage} from "amqp-extension";
import {MessageQueueSelfToUIRoutingKey} from "../../config/services/rabbitmq";
import {TrainResultStatus} from "../../domains/train-result/type";

export async function writeExtractedEvent(message: Message) {
    await publishMessage(buildMessage({
        options: {
            routingKey: MessageQueueSelfToUIRoutingKey.EVENT
        },
        type: TrainResultStatus.EXTRACTED,
        data: message.data,
        metadata: message.metadata
    }));

    return message;
}
