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
