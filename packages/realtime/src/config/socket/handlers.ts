/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { registerTrainSocketHandlers } from '../../domains/train/handlers';
import { registerUserHandlers } from '../../domains/user/handlers';
import { SocketServerInterface } from './type';

export function registerSocketHandlers(io: SocketServerInterface) {
    io.on('connection', (socket) => {
        registerUserHandlers(io, socket);
        registerTrainSocketHandlers(io, socket);
    });
}
