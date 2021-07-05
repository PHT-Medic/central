import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../modules/message-queue";
import {MQ_UI_SELF_COMMAND_ROUTING_KEY} from "../../config/services/rabbitmq";
import {AuthClient} from "../client";

export async function publishSelfQM(queueMessage: QueueMessage) {
    await publishQueueMessage(MQ_UI_SELF_COMMAND_ROUTING_KEY, queueMessage);
}

export function createSelfServiceSyncQMCommand(
    serviceId: string,
    client: Pick<AuthClient, 'id' | 'secret'>,
    metaData: Record<string, any> = {}
) : QueueMessage {
    return createQueueMessageTemplate('sync', {
        id: serviceId,
        clientId: client.id,
        clientSecret: client.secret
    }, metaData);
}
