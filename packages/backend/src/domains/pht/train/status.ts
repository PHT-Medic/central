export enum TrainBuildStatus {
    STARTING = 'starting',
    STOPPED = 'stopped',
    BUILDING = 'building',
    FINISHED = 'finished',
    FAILED = 'failed'
}

export type TrainBuildStatusType = keyof typeof TrainBuildStatus;

export function isTrainBuildStatus(type: string) : type is TrainBuildStatusType {
    return type in TrainBuildStatus;
}

// -------------------------------------------------------------------------

export enum TrainConfigurationStatus {
    FILES_UPLOADED = 'files_uploaded',
    HASH_GENERATED = 'hash_generated',
    HASH_SIGNED = 'hash_signed',
    FINISHED = 'finished'
}

export type TrainConfigurationStatusType = keyof typeof TrainConfigurationStatus;

export function isTrainConfigurationStatus(type: string) : type is TrainConfigurationStatusType {
    return type in TrainConfigurationStatus;
}

// -------------------------------------------------------------------------

export enum TrainRunStatus {
    STARTING = 'starting',
    STARTED = 'started',
    STOPPING = 'stopping',
    STOPPED = 'stopped',
    FINISHED = 'finished',
    FAILED = 'failed'
}

export type TrainRunStatusType = keyof typeof TrainRunStatus;

export function isTrainStationRunStatus(type: string) : type is TrainRunStatusType {
    return type in TrainRunStatus;
}
