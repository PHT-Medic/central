/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import {
    EntitySubscriberInterface, EventSubscriber, InsertEvent,
} from 'typeorm';
import { AuthClientType, Client } from '@personalhealthtrain/ui-common';
import { AuthClientSecurityComponentCommand } from '../../components/auth-security';
import { buildAuthClientSecurityQueueMessage } from '../../domains/extra/queue';

@EventSubscriber()
export class AuthClientSubscriber implements EntitySubscriberInterface<Client> {
    listenTo(): CallableFunction | string {
        return Client;
    }

    async afterInsert(event: InsertEvent<Client>): Promise<any | void> {
        if (
            typeof event.entity.service_id === 'string'
        ) {
            const queueMessage = buildAuthClientSecurityQueueMessage(
                AuthClientSecurityComponentCommand.SYNC,
                {
                    id: event.entity.service_id,
                    type: AuthClientType.SERVICE,
                    clientId: event.entity.id,
                    clientSecret: event.entity.secret,
                },
            );
            await publishMessage(queueMessage);
        }
    }
}
