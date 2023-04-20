/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum ProposalStationApprovalCommand {
    APPROVE = 'approve',
    REJECT = 'reject',
}

export enum ProposalStationApprovalStatus {
    REJECTED = 'rejected',
    APPROVED = 'approved',
}

export enum ProposalStationSocketServerToClientEventName {
    CREATED = 'proposalStationCreated',
    UPDATED = 'proposalStationUpdated',
    DELETED = 'proposalStationDeleted',
}

export enum ProposalStationSocketClientToServerEventName {
    SUBSCRIBE = 'proposalStationSubscribe',
    UNSUBSCRIBE = 'proposalStationUnsubscribe',

    IN_SUBSCRIBE = 'proposalStationInSubscribe',
    IN_UNSUBSCRIBE = 'proposalStationInUnsubscribe',

    OUT_SUBSCRIBE = 'proposalStationOutSubscribe',
    OUT_UNSUBSCRIBE = 'proposalStationOutUnsubscribe',
}
