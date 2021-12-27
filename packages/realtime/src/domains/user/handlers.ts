/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SocketInterface, SocketNamespaceInterface, SocketServerInterface } from '../../config/socket/type';

export function registerUserHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.user) return;

    const { user } = socket.data;

    socket.join(`users:${user.id}`);

    socket.on('disconnect', () => {
        socket.join(`users:${user.id}`);
    });
}
