/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainStationApprovalStatus {
    REJECTED = 'rejected',
    APPROVED = 'approved'
}

export type TrainStationApprovalStatusType = keyof typeof TrainStationApprovalStatus;

export function isTrainStationApprovalStatus(type: string) : type is TrainStationApprovalStatusType {
    return type in TrainStationApprovalStatus;
}

// -------------------------------------------------------------------------

export enum TrainStationRunStatus {
    ARRIVED = 'arrived',
    DEPARTED = 'departed'
}

export type TrainStationRunStatusType = keyof typeof TrainStationRunStatus;

export function isTrainStationRunStatus(type: string) : type is TrainStationRunStatusType {
    return type in TrainStationRunStatus;
}

export enum TrainStationStatic {
    INCOMING = 'incoming',
    OUTGOING = 'outgoing'
}
