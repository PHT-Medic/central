/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    MASTER_REALM_ID, PermissionID, Train, getAPITrain,
} from '@personalhealthtrain/ui-common';
import { UnauthorizedError } from '@typescript-error/http';
import { EntityCache, useRedisInstance } from 'redis-extension';
import { SocketInterface, SocketServerInterface } from '../../config/socket/type';

let trainCache : EntityCache<undefined, string> | undefined;

function useTrainCache() {
    if (typeof trainCache !== 'undefined') {
        return trainCache;
    }

    trainCache = new EntityCache<undefined, string>({
        redisDatabase: useRedisInstance('default'),
    }, {});

    trainCache.startScheduler();

    return trainCache;
}
export function registerTrainSocketHandlers(
    io: SocketServerInterface,
    socket: SocketInterface,
) {
    if (!socket.data.user) return;

    const { ability, user } = socket.data;

    socket.on('trainsSubscribe', async (id, cb) => {
        if (
            !ability.hasPermission(PermissionID.TRAIN_DROP) &&
            !ability.hasPermission(PermissionID.TRAIN_EDIT) &&
            !ability.hasPermission(PermissionID.TRAIN_EXECUTION_START) &&
            !ability.hasPermission(PermissionID.TRAIN_EXECUTION_STOP)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        if (id) {
            try {
                const trainCache = useTrainCache();
                let train : Train | undefined = await trainCache.get(id);
                if (!train) {
                    train = await getAPITrain(id);

                    await trainCache.set(id, train);
                }

                if (
                    train.realm_id !== user.realm_id &&
                    user.realm_id !== MASTER_REALM_ID
                ) {
                    cb(new UnauthorizedError());
                    return;
                }

                socket.join(`trains:${train.id}`);
                cb();
            } catch (e) {
                cb(e);
            }
        } else {
            if (user.realm_id === MASTER_REALM_ID) {
                socket.join('global-trains');
            }

            socket.join(`${user.realm_id}-trains`);
        }

        cb();
    });

    socket.on('trainsUnsubscribe', (id) => {
        if (id) {
            socket.leave(`trains:${id}`);
        } else {
            if (user.realm_id === MASTER_REALM_ID) {
                socket.leave('global-trains');
            }

            socket.leave(`${user.realm_id}-trains`);
        }
    });
}
