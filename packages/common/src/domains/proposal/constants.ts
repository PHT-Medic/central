/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum ProposalRisk {
    LOW = 'low',
    MID = 'mid',
    HIGH = 'high',
}

export enum ProposalSocketServerToClientEventName {
    CREATED = 'proposalCreated',
    UPDATED = 'proposalUpdated',
    DELETED = 'proposalDeleted',
}

export enum ProposalSocketClientToServerEventName {
    SUBSCRIBE = 'proposalSubscribe',
    UNSUBSCRIBE = 'proposalUnsubscribe',
}
