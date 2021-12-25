/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@personalhealthtrain/ui-common';
import { UnauthorizedError } from '@typescript-error/http';
import { SocketInterface, SocketServerInterface } from '../../config/socket/type';

export function registerTrainSocketHandlers(io: SocketServerInterface, socket: SocketInterface) {
    if (!socket.data.user) return;

    const { ability, user } = socket.data;

    socket.on('trainsSubscribe', (id, cb) => {
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
            socket.leave(`${user.realm_id}.trains:${id}`);
        } else {
            socket.leave(`${user.realm_id}.trains`);
        }

        cb();
    });

    socket.on('trainsUnsubscribe', (id) => {
        if (id) {
            socket.leave(`${user.realm_id}.trains:${id}`);
        } else {
            socket.leave(`${user.realm_id}.trains`);
        }
    });
}
