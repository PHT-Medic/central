/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import {
    TrainSocketServerToClientEventName,
    buildSocketRealmNamespaceName, buildSocketTrainRoomName,
} from '@personalhealthtrain/central-common';
import { publish as publishMessage } from 'amqp-extension';
import { TrainCommand } from '../../components/train/constants';
import { emitSocketServerToClientEvent } from '../../config';
import { TrainEntity, buildTrainQueueMessage } from '../../domains/train';

function publish(
    operation: `${TrainSocketServerToClientEventName}`,
    item: TrainEntity,
) {
    emitSocketServerToClientEvent({
        configuration: [
            {
                roomNameFn: buildSocketTrainRoomName,
                namespace: buildSocketRealmNamespaceName(item.realm_id),
            },
            {
                roomNameFn: buildSocketTrainRoomName,
            },
        ],
        operation,
        item,
    });
}

@EventSubscriber()
export class TrainSubscriber implements EntitySubscriberInterface<TrainEntity> {
    listenTo(): CallableFunction | string {
        return TrainEntity;
    }

    async afterInsert(event: InsertEvent<TrainEntity>): Promise<any> {
        publish(TrainSocketServerToClientEventName.CREATED, event.entity);

        const message = buildTrainQueueMessage(
            TrainCommand.SETUP,
            {
                id: event.entity.id,
            },
        );

        await publishMessage(message);
    }

    afterUpdate(event: UpdateEvent<TrainEntity>): Promise<any> | void {
        publish(TrainSocketServerToClientEventName.UPDATED, event.entity as TrainEntity);
    }

    async beforeRemove(event: RemoveEvent<TrainEntity>): Promise<any> {
        publish(TrainSocketServerToClientEventName.DELETED, event.entity);

        const message = buildTrainQueueMessage(
            TrainCommand.CLEANUP,
            {
                id: event.entity.id,
            },
        );

        await publishMessage(message);

        return Promise.resolve(undefined);
    }
}
