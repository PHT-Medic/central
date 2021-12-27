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
import { RedisCache, useRedisInstance } from 'redis-extension';
import { stringifyAuthorizationHeader } from '@typescript-auth/core';
import { SocketInterface, SocketNamespaceInterface, SocketServerInterface } from '../../config/socket/type';

let trainCache : RedisCache<string> | undefined;

function useTrainCache() {
    if (typeof trainCache !== 'undefined') {
        return trainCache;
    }

    trainCache = new RedisCache<string>({
        redis: useRedisInstance('default'),
    }, {
        prefix: 'train',
    });

    trainCache.startScheduler();

    return trainCache;
}
export function registerTrainSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.user) return;

    socket.on('trainsSubscribe', async (context, cb) => {
        context ??= {};

        if (
            !socket.data.ability.hasPermission(PermissionID.TRAIN_DROP) &&
            !socket.data.ability.hasPermission(PermissionID.TRAIN_EDIT) &&
            !socket.data.ability.hasPermission(PermissionID.TRAIN_EXECUTION_START) &&
            !socket.data.ability.hasPermission(PermissionID.TRAIN_EXECUTION_STOP)
        ) {
            if (typeof cb === 'function') {
                cb(new UnauthorizedError());
            }

            return;
        }

        if (context.id) {
            try {
                const trainCache = useTrainCache();
                let train : Train | undefined = await trainCache.get(context.id);
                if (!train) {
                    train = await getAPITrain(context.id, {}, {
                        headers: {
                            Authorization: stringifyAuthorizationHeader({
                                type: 'Bearer',
                                token: socket.data.token,
                            }),
                        },
                    });

                    await trainCache.set(context.id, train);
                }

                if (
                    train.realm_id !== socket.data.user.realm_id &&
                    socket.data.user.realm_id !== MASTER_REALM_ID
                ) {
                    cb(new UnauthorizedError());
                    return;
                }

                socket.join(`trains#${train.id}`);

                if (typeof cb === 'function') {
                    cb();
                }
            } catch (e) {
                if (typeof cb === 'function') {
                    cb(e);
                }
            }

            return;
        }

        socket.join('trains');

        if (typeof cb === 'function') {
            cb();
        }
    });

    socket.on('trainsUnsubscribe', (context) => {
        context ??= {};

        if (context.id) {
            socket.leave(`trains#${context.id}`);
        } else {
            socket.leave('trains');
        }
    });
}
