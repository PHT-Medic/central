/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Proposal, ProposalStation, Train, TrainResult,
} from '../../core';

type SimpleOperation = 'Created' | 'Updated' | 'Deleted';

export type SocketServerToClientEvents = {
    // permitted for (proposal-owner)
    [K in `proposal${SimpleOperation}`]: (data: Proposal) => void
} & {
    // permitted for (proposal-owner, proposal-target)
    [T in `proposalStation${SimpleOperation}`]: (data: ProposalStation) => void
} & {
    // permitted for (train-owner)
    [T in `train${SimpleOperation}`]: (data: Train) => void
} & {
    // permitted for (train-owner, train-result-owner)
    [T in `trainResult${SimpleOperation}`]: (data: TrainResult) => void
} & {
    // permitted for (train-owner, train-station-owner)
    [T in `trainStation${SimpleOperation}`]: (data: Train) => void
};

type SubUnsubOperation = 'Subscribe' | 'Unsubscribe';

export type SocketClientToServerEvents = {
    [K in `proposals${SubUnsubOperation}`]: (id?: typeof Proposal.prototype.id) => void
} & {
    [K in `proposalStations${SubUnsubOperation}`]: (id?: typeof ProposalStation.prototype.id) => void
} & {
    [K in `trains${SubUnsubOperation}`]: (id?: typeof Train.prototype.id, cb?: (error?: Error) => void) => void
} & {
    [K in `trainResults${SubUnsubOperation}`]: (id?: typeof Train.prototype.id) => void
} & {
    [K in `trainStations${SubUnsubOperation}`]: (id?: typeof Train.prototype.id) => void
};

export interface SocketInterServerEvents {

}
