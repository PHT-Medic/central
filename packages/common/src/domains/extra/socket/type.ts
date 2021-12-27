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
    // permitted for (proposal-owner)
    [K in `proposal${SimpleOperation}`]: (data: SocketServerToClientEventContext<Proposal>) => void
} & {
    // permitted for (proposal-owner, proposal-target)
    [T in `proposalStation${SimpleOperation}`]: (data: SocketServerToClientEventContext<ProposalStation>) => void
} & {
    // permitted for (train-owner)
    [T in `train${SimpleOperation}`]: (data: SocketServerToClientEventContext<Train>) => void
} & {
    // permitted for (train-owner, train-result-owner)
    [T in `trainResult${SimpleOperation}`]: (data: SocketServerToClientEventContext<TrainResult>) => void
} & {
    // permitted for (train-owner, train-station-owner)
    [T in `trainStation${SimpleOperation}`]: (data: SocketServerToClientEventContext<TrainStation>) => void
};

type SubUnsubOperation = 'Subscribe' | 'Unsubscribe';

export type SocketClientToServerEvents = {
    [K in `proposals${SubUnsubOperation}`]: (
        context: {
            id?: typeof Proposal.prototype.id
        },
        cb?: (error?: Error) => void) => void
} & {
    [K in `proposalStations${SubUnsubOperation}`]: (
        context: {
            id?: typeof ProposalStation.prototype.id
        },
        cb?: (error?: Error) => void) => void
} & {
    [K in `trains${SubUnsubOperation}`]: (
        context: {
            id?: typeof Train.prototype.id
        },
        cb?: (error?: Error) => void
    ) => void
} & {
    [K in `trainResults${SubUnsubOperation}`]: (
        context: {
            id?: typeof TrainResult.prototype.id
        },
        cb?: (error?: Error) => void
    ) => void
} & {
    [K in `trainStations${SubUnsubOperation}`]: (
        context: {
            id?: typeof TrainStation.prototype.id
        },
        cb?: (error?: Error) => void
    ) => void
};

export interface SocketInterServerEvents {

}

// -----------------------------------
