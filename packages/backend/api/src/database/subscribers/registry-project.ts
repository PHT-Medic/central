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
    buildSocketRealmNamespaceName,
    buildSocketRegistryProjectRoomName,
} from '@personalhealthtrain/central-common';
import { useSocketEmitter } from '../../config/socket-emitter';
import { RegistryProjectEntity } from '../../domains/core/registry-project/entity';

enum Operation {
    CREATE = 'registryProjectCreated',
    UPDATE = 'registryProjectUpdated',
    DELETE = 'registryProjectDeleted',
}

function publish(
    operation: `${Operation}`,
    item: RegistryProjectEntity,
) {
    useSocketEmitter()
        .in(buildSocketRegistryProjectRoomName())
        .emit(operation, {
            data: item,
            meta: {
                roomName: buildSocketRegistryProjectRoomName(),
            },
        });

    if (operation !== Operation.CREATE) {
        useSocketEmitter()
            .in(buildSocketRegistryProjectRoomName(item.id))
            .emit(operation, {
                data: item,
                meta: {
                    roomName: buildSocketRegistryProjectRoomName(item.id),
                    roomId: item.id,
                },
            });
    }

    const workspaces = [
        buildSocketRealmNamespaceName(item.realm_id),
    ];

    for (let i = 0; i < workspaces.length; i++) {
        useSocketEmitter()
            .of(workspaces[i])
            .in(buildSocketRegistryProjectRoomName())
            .emit(operation, {
                data: item,
                meta: {
                    roomName: buildSocketRegistryProjectRoomName(),
                },
            });
    }

    if (operation !== Operation.CREATE) {
        for (let i = 0; i < workspaces.length; i++) {
            useSocketEmitter()
                .of(workspaces[i])
                .in(buildSocketRegistryProjectRoomName(item.id))
                .emit(operation, {
                    data: item,
                    meta: {
                        roomName: buildSocketRegistryProjectRoomName(item.id),
                        roomId: item.id,
                    },
                });
        }
    }
}

@EventSubscriber()
export class RegistryProjectSubscriber implements EntitySubscriberInterface<RegistryProjectEntity> {
    listenTo(): CallableFunction | string {
        return RegistryProjectEntity;
    }

    afterInsert(event: InsertEvent<RegistryProjectEntity>): Promise<any> | void {
        publish(Operation.CREATE, event.entity);
    }

    afterUpdate(event: UpdateEvent<RegistryProjectEntity>): Promise<any> | void {
        publish(Operation.UPDATE, event.entity as RegistryProjectEntity);
        return undefined;
    }

    beforeRemove(event: RemoveEvent<RegistryProjectEntity>): Promise<any> | void {
        publish(Operation.DELETE, event.entity);

        return undefined;
    }
}
