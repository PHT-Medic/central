/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { registerTrainLogSocketHandlers } from './controllers/train-log/handlers';
import { registerTrainSocketHandlers } from './controllers/train/handlers';
import { registerUserHandlers } from './controllers/user/handlers';
import type { SocketNamespaceInterface, SocketServerInterface } from './type';
import { registerProposalSocketHandlers } from './controllers/proposal/handlers';
import {
    registerProposalStationForRealmSocketHandlers,
    registerProposalStationSocketHandlers,
} from './controllers/proposal-station/handlers';
import {
    registerTrainStationForRealmSocketHandlers,
    registerTrainStationSocketHandlers,
} from './controllers/train-station/handlers';
import { registerTrainFileSocketHandlers } from './controllers/train-file/handlers';
import { registerStationSocketHandlers } from './controllers/station/handlers';
import { registerRegistryProjectSocketHandlers } from './controllers/registry-project/handlers';

export function registerSocketHandlers(io: SocketServerInterface) {
    io.on('connection', (socket) => {
        // this will be the root namespace with all realm resources

        if (socket.data.userId) {
            registerUserHandlers(io, socket);
        }

        registerProposalSocketHandlers(io, socket);
        registerProposalStationSocketHandlers(io, socket);

        registerRegistryProjectSocketHandlers(io, socket);

        registerStationSocketHandlers(io, socket);

        registerTrainSocketHandlers(io, socket);
        registerTrainFileSocketHandlers(io, socket);
        registerTrainLogSocketHandlers(io, socket);
        registerTrainStationSocketHandlers(io, socket);
    });
}

export function registerSocketNamespaceHandlers(io: SocketNamespaceInterface) {
    io.on('connection', (socket) => {
        if (socket.data.userId) {
            registerUserHandlers(io, socket);
        }

        registerProposalSocketHandlers(io, socket);
        registerProposalStationForRealmSocketHandlers(io, socket);

        registerRegistryProjectSocketHandlers(io, socket);

        registerStationSocketHandlers(io, socket);

        registerTrainSocketHandlers(io, socket);
        registerTrainFileSocketHandlers(io, socket);
        registerTrainLogSocketHandlers(io, socket);
        registerTrainStationForRealmSocketHandlers(io, socket);
    });
}
