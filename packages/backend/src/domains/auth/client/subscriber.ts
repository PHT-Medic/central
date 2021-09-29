import {publishMessage} from "amqp-extension";
import {EntitySubscriberInterface, InsertEvent, UpdateEvent} from "typeorm";
import {Client} from "@personalhealthtrain/ui-common";
import {ServiceSecurityComponent} from "../../../components/service-security";
import {buildServiceSecurityQueueMessage} from "../../service/queue";

export class AuthClientSubscriber implements EntitySubscriberInterface<Client> {
    listenTo(): Function | string {
        return Client;
    }

    async afterInsert(event: InsertEvent<Client>): Promise<any|void> {
        if(typeof event.entity.service_id === 'string') {
            const queueMessage = buildServiceSecurityQueueMessage(
                ServiceSecurityComponent.SYNC,
                event.entity.service_id,
                {
                    id: event.entity.id,
                    secret: event.entity.secret
                }
            );
            await publishMessage(queueMessage);
        }
    }

    async afterUpdate(event: UpdateEvent<Client>): Promise<any|void> {
        if(typeof event.entity.service_id === 'string') {
            const queueMessage = buildServiceSecurityQueueMessage(
                ServiceSecurityComponent.SYNC,
                event.entity.service_id,
                {
                    id: event.entity.id,
                    secret: event.entity.secret
                }
            );
            await publishMessage(queueMessage);
        }
    }
}
