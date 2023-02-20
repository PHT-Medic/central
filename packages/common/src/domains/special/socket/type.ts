/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Proposal,
    ProposalSocketClientToServerEventName,
    ProposalSocketServerToClientEventName,
    ProposalStation,
    ProposalStationSocketClientToServerEventName,
    ProposalStationSocketServerToClientEventName,
    RegistryProject,
    RegistryProjectSocketClientToServerEventName,
    RegistryProjectSocketServerToClientEventName,
    Station,
    StationSocketClientToServerEventName,
    StationSocketServerToClientEventName,
    Train,
    TrainFile,
    TrainFileSocketClientToServerEventName,
    TrainFileSocketServerToClientEventName,
    TrainLog, TrainLogSocketClientToServerEventName,
    TrainLogSocketServerToClientEventName,
    TrainSocketClientToServerEventName,
    TrainSocketServerToClientEventName,
    TrainStation,
    TrainStationSocketClientToServerEventName,
    TrainStationSocketServerToClientEventName,
} from '../../core';

export type SocketServerToClientEventContext<T> = {
    meta: {
        roomName?: string,
        roomId?: string | number
    },
    data: T
};

export type SocketServerToClientEventName = `${ProposalSocketServerToClientEventName}` |
    `${ProposalStationSocketServerToClientEventName}` |
    `${RegistryProjectSocketServerToClientEventName}` |
    `${StationSocketServerToClientEventName}` |
    `${TrainSocketServerToClientEventName}` |
    `${TrainLogSocketServerToClientEventName}` |
    `${TrainFileSocketServerToClientEventName}` |
    `${TrainStationSocketServerToClientEventName}`;

export type SocketServerToClientItem<O extends SocketServerToClientEventName> = O extends `${ProposalSocketServerToClientEventName}` ?
    Proposal :
    O extends `${ProposalStationSocketServerToClientEventName}` ?
        ProposalStation :
        O extends `${RegistryProjectSocketServerToClientEventName}` ?
            RegistryProject :
            O extends `${StationSocketServerToClientEventName}` ?
                Station :
                O extends `${TrainSocketServerToClientEventName}` ?
                    Train :
                    O extends `${TrainLogSocketServerToClientEventName}` ?
                        TrainLog :
                        O extends `${TrainFileSocketServerToClientEventName}` ?
                            TrainFile :
                            O extends `${TrainStationSocketServerToClientEventName}` ?
                                TrainStation : never;

export type SocketServerToClientEvents = {
    [K in SocketServerToClientEventName]: (data: SocketServerToClientEventContext<SocketServerToClientItem<K>>) => void
};

// ------------------------------------------------------------------------------------

export type SocketClientToServerEventContext<K extends Record<string, any>> = {
    data?: Partial<K>,
    meta?: Record<string, any>
};

export type SocketClientToServerEventName = `${ProposalSocketClientToServerEventName}` |
    `${ProposalStationSocketClientToServerEventName}` |
    `${RegistryProjectSocketClientToServerEventName}` |
    `${StationSocketClientToServerEventName}` |
    `${TrainSocketClientToServerEventName}` |
    `${TrainLogSocketClientToServerEventName}` |
    `${TrainFileSocketClientToServerEventName}` |
    `${TrainStationSocketClientToServerEventName}`;

export type SocketClientToServerItem<O extends SocketClientToServerEventName> = O extends `${ProposalSocketClientToServerEventName}` ?
    Proposal :
    O extends `${ProposalStationSocketClientToServerEventName}` ?
        ProposalStation :
        O extends `${RegistryProjectSocketClientToServerEventName}` ?
            RegistryProject :
            O extends `${StationSocketClientToServerEventName}` ?
                Station :
                O extends `${TrainSocketClientToServerEventName}` ?
                    Train :
                    O extends `${TrainLogSocketClientToServerEventName}` ?
                        TrainLog :
                        O extends `${TrainFileSocketClientToServerEventName}` ?
                            TrainFile :
                            O extends `${TrainStationSocketClientToServerEventName}` ?
                                TrainStation : never;

export type SocketClientToServerEvents = {
    [K in `${SocketClientToServerEventName}`]: (
        context?: SocketClientToServerEventContext<SocketClientToServerItem<K>>,
        cb?: (error?: Error) => void
    ) => void
};

export interface SocketInterServerEvents {

}

// -----------------------------------
