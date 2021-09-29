import {buildMessage, Message} from "amqp-extension";
import {Client} from "@personalhealthtrain/ui-common";
import {MQ_UI_SELF_COMMAND_ROUTING_KEY} from "@personalhealthtrain/ui-common";
import {ServiceSecurityComponent} from "../../components/service-security";

export function buildServiceSecurityQueueMessage(
    type: ServiceSecurityComponent,
    serviceId: string,
    client: Pick<Client, 'id' | 'secret'>,
    metaData: Record<string, any> = {}
) : Message {
    return buildMessage({
        options: {
            routingKey: MQ_UI_SELF_COMMAND_ROUTING_KEY
        },
        type,
        data: {
            clientId: client.id,
            clientSecret: client.secret
        },
        metadata: metaData
    })
}
