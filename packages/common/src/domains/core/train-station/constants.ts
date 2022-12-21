/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainStationApprovalCommand {
    APPROVE = 'approve',
    REJECT = 'reject',
}

export enum TrainStationApprovalStatus {
    REJECTED = 'rejected',
    APPROVED = 'approved',
}

// -------------------------------------------------------------------------

export enum TrainStationRunStatus {
    ARRIVED = 'arrived',
    PULLED = 'pulled',
    PUSHED = 'pushed',
    DEPARTED = 'departed',
    FAILED = 'failed',
}

// -------------------------------------------------------------------------

export enum TrainStationStatic {
    INCOMING = 'incoming',
    OUTGOING = 'outgoing',
}

// -------------------------------------------------------------------------

export enum TrainStationSocketServerToClientEventName {
    CREATED = 'trainStationCreated',
    UPDATED = 'trainStationUpdated',
    DELETED = 'trainStationDeleted',
}

export enum TrainStationSocketClientToServerEventName {
    SUBSCRIBE = 'trainStationSubscribe',
    UNSUBSCRIBE = 'trainStationUnsubscribe',

    IN_SUBSCRIBE = 'trainStationInSubscribe',
    IN_UNSUBSCRIBE = 'trainStationInUnsubscribe',

    OUT_SUBSCRIBE = 'trainStationOutSubscribe',
    OUT_UNSUBSCRIBE = 'trainStationOutUnsubscribe',
}
