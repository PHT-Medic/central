/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { Train } from '@personalhealthtrain/ui-common';
import { useSocketEmitter } from '../../config/socket-emitter';

@EventSubscriber()
export class TrainSubscriber implements EntitySubscriberInterface<Train> {
    listenTo(): CallableFunction | string {
        return Train;
    }

    afterInsert(event: InsertEvent<Train>): Promise<any> | void {
        useSocketEmitter()
            .in(`${event.entity.realm_id}.trains`)
            .emit('trainCreated', event.entity);
    }

    afterUpdate(event: UpdateEvent<Train>): Promise<any> | void {
        useSocketEmitter()
            .in(`${event.entity.realm_id}.trains`)
            .emit('trainUpdated', event.entity as Train);
        return undefined;
    }

    afterRemove(event: RemoveEvent<Train>): Promise<any> | void {
        useSocketEmitter()
            .in(`${event.entity.realm_id}.trains`)
            .emit('trainDeleted', event.entity);
        return undefined;
    }
}
