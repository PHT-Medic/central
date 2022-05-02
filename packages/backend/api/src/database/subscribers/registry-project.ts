/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import {
    RegistryProjectSocketServerToClientEventName,
    buildSocketRealmNamespaceName, buildSocketRegistryProjectRoomName,
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
                namespace: buildSocketRealmNamespaceName(item.realm_id),
            },
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
