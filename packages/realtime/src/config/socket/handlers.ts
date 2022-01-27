/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { registerTrainSocketHandlers } from '../../domains/train/handlers';
import { registerUserHandlers } from '../../domains/user/handlers';
import { SocketNamespaceInterface, SocketServerInterface } from './type';
import { registerProposalSocketHandlers } from '../../domains/proposal/handlers';
import { registerProposalStationSocketHandlers } from '../../domains/proposal-station/handlers';
import { registerTrainStationSocketHandlers } from '../../domains/train-station/handlers';
import { registerTrainFileSocketHandlers } from '../../domains/train-file/handlers';
import { registerStationSocketHandlers } from '../../domains/station/handlers';

export function registerSocketHandlers(io: SocketServerInterface) {
    io.on('connection', (socket) => {
        // this will be the root namespace with all realm resources
    });
}

export function registerSocketNamespaceHandlers(io: SocketNamespaceInterface) {
    io.on('connection', (socket) => {
        registerUserHandlers(io, socket);

        registerProposalSocketHandlers(io, socket);
        registerProposalStationSocketHandlers(io, socket);
        registerStationSocketHandlers(io, socket);
        registerTrainSocketHandlers(io, socket);
        registerTrainFileSocketHandlers(io, socket);
        registerTrainStationSocketHandlers(io, socket);
    });
}
