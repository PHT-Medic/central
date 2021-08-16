import {QueueMessage} from "../../../modules/message-queue";

export async function extendDispatcherHarborData(message: QueueMessage) : Promise<QueueMessage> {
    return message;
}
