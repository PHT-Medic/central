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
    RegistryProjectSocketServerToClientEventName,
    buildSocketRegistryProjectRoomName,
} from '@personalhealthtrain/central-common';
import {
    emitSocketServerToClientEvent,
} from '../../config/socket-emitter';
import { RegistryProjectEntity } from '../../domains/core/registry-project/entity';

function publish(
    operation: `${RegistryProjectSocketServerToClientEventName}`,
    item: RegistryProjectEntity,
) {
    emitSocketServerToClientEvent({
        configuration: [
            {
                roomNameFn: buildSocketRegistryProjectRoomName,
            },
        ],
        operation,
        item,
    });
}

@EventSubscriber()
export class RegistryProjectSubscriber implements EntitySubscriberInterface<RegistryProjectEntity> {
    listenTo(): CallableFunction | string {
        return RegistryProjectEntity;
    }

    afterInsert(event: InsertEvent<RegistryProjectEntity>): Promise<any> | void {
        publish(RegistryProjectSocketServerToClientEventName.CREATED, event.entity);
    }

    afterUpdate(event: UpdateEvent<RegistryProjectEntity>): Promise<any> | void {
        publish(RegistryProjectSocketServerToClientEventName.UPDATED, event.entity as RegistryProjectEntity);
        return undefined;
    }

    beforeRemove(event: RemoveEvent<RegistryProjectEntity>): Promise<any> | void {
        publish(RegistryProjectSocketServerToClientEventName.DELETED, event.entity);

        return undefined;
    }
}
