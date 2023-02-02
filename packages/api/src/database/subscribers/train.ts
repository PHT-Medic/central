/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import {
    TrainQueueCommand, TrainSocketServerToClientEventName,
    buildSocketRealmNamespaceName, buildSocketTrainRoomName,
} from '@personalhealthtrain/central-common';
import { buildMessage, publishMessage } from 'amqp-extension';
import { MessageQueueRoutingKey, emitSocketServerToClientEvent } from '../../config';
import { TrainEntity } from '../../domains/core/train/entity';

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

        const message = buildMessage({
            options: {
                routingKey: MessageQueueRoutingKey.COMMAND,
            },
            type: TrainQueueCommand.SETUP,
            data: {
                id: event.entity.id,
            },
            metadata: {},
        });

        await publishMessage(message);
    }

    afterUpdate(event: UpdateEvent<TrainEntity>): Promise<any> | void {
        publish(TrainSocketServerToClientEventName.UPDATED, event.entity as TrainEntity);
    }

    async beforeRemove(event: RemoveEvent<TrainEntity>): Promise<any> {
        publish(TrainSocketServerToClientEventName.DELETED, event.entity);

        const message = buildMessage({
            options: {
                routingKey: MessageQueueRoutingKey.COMMAND,
            },
            type: TrainQueueCommand.CLEANUP,
            data: {
                id: event.entity.id,
            },
            metadata: {},
        });

        await publishMessage(message);

        return Promise.resolve(undefined);
    }
}
