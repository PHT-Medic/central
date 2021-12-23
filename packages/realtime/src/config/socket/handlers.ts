/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Server, Socket } from 'socket.io';

export function registerSocketHandlers(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log(socket.id);
    });
}
