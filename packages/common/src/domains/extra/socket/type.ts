/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Proposal, ProposalStation, Train, TrainResult, TrainStation,
} from '../../core';

type SimpleOperation = 'Created' | 'Updated' | 'Deleted';

type SocketServerToClientEventContext<T> = {
    meta: {
        roomName?: string,
        roomId?: string | number
    },
    data: T
};

export type SocketServerToClientEvents = {
    [K in `proposal${SimpleOperation}`]: (data: SocketServerToClientEventContext<Proposal>) => void
} & {
    [T in `proposalStation${SimpleOperation}`]: (data: SocketServerToClientEventContext<ProposalStation>) => void
} & {
    [T in `train${SimpleOperation}`]: (data: SocketServerToClientEventContext<Train>) => void
} & {
    [T in `trainResult${SimpleOperation}`]: (data: SocketServerToClientEventContext<TrainResult>) => void
} & {
    [T in `trainStation${SimpleOperation}`]: (data: SocketServerToClientEventContext<TrainStation>) => void
};

type SubUnsubOperation = 'Subscribe' | 'Unsubscribe';

export type SocketClientToServerEventContext<K extends Record<string, any>> = {
    data?: {
        [T in keyof K]?: K[T]
    },
    meta?: Record<string, any>
};

export type SocketClientToServerEvents = {
    [K in `proposals${SubUnsubOperation}`]: (
        context?: SocketClientToServerEventContext<Proposal>,
        cb?: (error?: Error) => void
    ) => void
} & {
    [K in `proposalStationsIn${SubUnsubOperation}`]: (
        context?: SocketClientToServerEventContext<ProposalStation>,
        cb?: (error?: Error) => void
    ) => void
} & {
    [K in `proposalStationsOut${SubUnsubOperation}`]: (
        context?: SocketClientToServerEventContext<ProposalStation>,
        cb?: (error?: Error) => void
    ) => void
} & {
    [K in `trains${SubUnsubOperation}`]: (
        context?: SocketClientToServerEventContext<Train>,
        cb?: (error?: Error) => void
    ) => void
} & {
    [K in `trainResults${SubUnsubOperation}`]: (
        context?: SocketClientToServerEventContext<TrainResult>,
        cb?: (error?: Error) => void
    ) => void
} & {
    [K in `trainStationsIn${SubUnsubOperation}`]: (
        context?: SocketClientToServerEventContext<TrainStation>,
        cb?: (error?: Error) => void
    ) => void
} & {
    [K in `trainStationsOut${SubUnsubOperation}`]: (
        context?: SocketClientToServerEventContext<TrainStation>,
        cb?: (error?: Error) => void
    ) => void
};

export interface SocketInterServerEvents {

}

// -----------------------------------
