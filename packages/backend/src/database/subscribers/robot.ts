/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publishMessage } from 'amqp-extension';
import {
    EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent,
} from 'typeorm';
import { RobotEntity } from '@typescript-auth/server';
import { buildServiceSecurityQueueMessage } from '../../domains/extra/service/queue';
import { ServiceCommand } from '../../domains/extra/service/constants';

@EventSubscriber()
export class RobotSubscriber implements EntitySubscriberInterface<RobotEntity> {
    listenTo(): CallableFunction | string {
        return RobotEntity;
    }

    async afterInsert(event: InsertEvent<RobotEntity>): Promise<any | void> {
        const queueMessage = buildServiceSecurityQueueMessage(
            ServiceCommand.ROBOT_SECRET_SYNC,
            {
                id: event.entity.name,
                robotId: event.entity.id,
                robotSecret: event.entity.secret,
            },
        );

        await publishMessage(queueMessage);
    }

    async afterUpdate(event: UpdateEvent<RobotEntity>): Promise<any | void> {
        const queueMessage = buildServiceSecurityQueueMessage(
            ServiceCommand.ROBOT_SECRET_SYNC,
            {
                id: event.entity.name,
                robotId: event.entity.id,
                robotSecret: event.entity.secret,
            },
        );

        await publishMessage(queueMessage);
    }
}
