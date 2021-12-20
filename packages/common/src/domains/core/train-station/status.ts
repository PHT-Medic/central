/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainStationApprovalStatus {
    REJECTED = 'rejected',
    APPROVED = 'approved',
}

export type TrainStationApprovalStatusType = `${TrainStationApprovalStatus}`;

const TrainStationApprovalStatusValues = Object.values(TrainStationApprovalStatus);
export function isTrainStationApprovalStatus(type: any) : type is TrainStationApprovalStatusType {
    return TrainStationApprovalStatusValues.indexOf(type) !== -1;
}

// -------------------------------------------------------------------------

export enum TrainStationRunStatus {
    ARRIVED = 'arrived',
    PULLED = 'pulled',
    PUSHED = 'pushed',
    DEPARTED = 'departed',
    FAILED = 'failed',
}

export type TrainStationRunStatusType = `${TrainStationRunStatus}`;

const TrainStationRunStatusValues = Object.values(TrainStationRunStatus);
export function isTrainStationRunStatus(type: any) : type is TrainStationRunStatusType {
    return TrainStationRunStatusValues.indexOf(type) !== -1;
}

// -------------------------------------------------------------------------

export enum TrainStationStatic {
    INCOMING = 'incoming',
    OUTGOING = 'outgoing',
}
