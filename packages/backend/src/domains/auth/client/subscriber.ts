import {EntitySubscriberInterface, InsertEvent, UpdateEvent} from "typeorm";
import {createSelfServiceSyncQMCommand, publishSelfQM} from "../../service/queue";
import {Client} from "./index";

export class AuthClientSubscriber implements EntitySubscriberInterface<Client> {
    listenTo(): Function | string {
        return Client;
    }

    async afterInsert(event: InsertEvent<Client>): Promise<any|void> {
        if(typeof event.entity.service_id === 'string') {
            const queueMessage = createSelfServiceSyncQMCommand(
                event.entity.service_id,
                {
                    id: event.entity.id,
                    secret: event.entity.secret
                }
            );
            await publishSelfQM(queueMessage);
        }
    }

    async afterUpdate(event: UpdateEvent<Client>): Promise<any|void> {
        if(typeof event.entity.service_id === 'string') {
            const queueMessage = createSelfServiceSyncQMCommand(
                event.entity.service_id,
                {
                    id: event.entity.id,
                    secret: event.entity.secret
                }
            );
            await publishSelfQM(queueMessage);
        }
    }
}
