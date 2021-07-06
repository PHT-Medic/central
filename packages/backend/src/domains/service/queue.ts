import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {MQ_UI_SELF_COMMAND_ROUTING_KEY} from "../../config/services/rabbitmq";
import {Client} from "../auth/client";

export async function publishSelfQM(queueMessage: QueueMessage) {
    await publishQueueMessage(MQ_UI_SELF_COMMAND_ROUTING_KEY, queueMessage);
}

export function createSelfServiceSyncQMCommand(
    serviceId: string,
    client: Pick<Client, 'id' | 'secret'>,
    metaData: Record<string, any> = {}
) : QueueMessage {
    return createQueueMessageTemplate('sync', {
        id: serviceId,
        clientId: client.id,
        clientSecret: client.secret
    }, metaData);
}
