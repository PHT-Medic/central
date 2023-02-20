/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntitySubscriberInterface, RemoveEvent } from 'typeorm';
import { EventSubscriber } from 'typeorm';
import { RobotEntity } from '@authup/server-database';
import { publish } from 'amqp-extension';
import { buildSecretStorageQueueMessage } from '../../domains/special/secret-storage/queue';
import { SecretStorageQueueCommand, SecretStorageQueueEntityType } from '../../domains/special/secret-storage/constants';

@EventSubscriber()
export class RobotSubscriber implements EntitySubscriberInterface<RobotEntity> {
    listenTo(): CallableFunction | string {
        return RobotEntity;
    }

    async afterRemove(event: RemoveEvent<RobotEntity>): Promise<Promise<any> | void> {
        if (!event.entity.name) {
            return;
        }

        const queueMessage = buildSecretStorageQueueMessage(
            SecretStorageQueueCommand.DELETE,
            {
                type: SecretStorageQueueEntityType.ROBOT,
                name: event.entity.name,
            },
        );

        await publish(queueMessage);
    }
}
