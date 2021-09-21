import {MQ_UI_SELF_COMMAND_ROUTING_KEY} from "../../config/services/rabbitmq";
import {Client} from "../auth/client";
import {buildQueueMessage, QueueMessage} from "../../modules/message-queue";
import {ServiceSecurityComponent} from "../../components/service-security";

export function buildServiceSecurityQueueMessage(
    type: ServiceSecurityComponent,
    serviceId: string,
    client: Pick<Client, 'id' | 'secret'>,
    metaData: Record<string, any> = {}
) : QueueMessage {
    return buildQueueMessage({
        routingKey: MQ_UI_SELF_COMMAND_ROUTING_KEY,
        type,
        data: {
            clientId: client.id,
            clientSecret: client.secret
        },
        metadata: metaData
    })
}
