/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainBuildStatus {
    STARTING = 'starting', // ui trigger
    STARTED = 'started', // tb trigger

    STOPPING = 'stopping', // ui trigger
    STOPPED = 'stopped', // tb trigger

    FINISHED = 'finished', // tb trigger
    FAILED = 'failed', // tb trigger
}

export type TrainBuildStatusType = `${TrainBuildStatus}`;

const TrainBuildStatusValues = Object.values(TrainBuildStatus);
export function isTrainBuildStatus(type: any) : type is TrainBuildStatusType {
    return TrainBuildStatusValues.indexOf(type) !== -1;
}

// -------------------------------------------------------------------------

export enum TrainConfigurationStatus {
    RESOURCE_CONFIGURED = 'resource_configured',
    HASH_GENERATED = 'hash_generated',
    HASH_SIGNED = 'hash_signed',
    FINISHED = 'finished',
}

export type TrainConfigurationStatusType = `${TrainConfigurationStatus}`;

const TrainConfigurationStatusValues = Object.values(TrainConfigurationStatus);
export function isTrainConfigurationStatus(type: any) : type is TrainConfigurationStatusType {
    return TrainConfigurationStatusValues.indexOf(type) !== -1;
}

// -------------------------------------------------------------------------

export enum TrainRunStatus {
    STARTING = 'starting',
    STARTED = 'started',

    STOPPING = 'stopping',
    STOPPED = 'stopped',

    FINISHED = 'finished',
    FAILED = 'failed',
}

export type TrainRunStatusType = `${TrainRunStatus}`;

const TrainRunStatusValues = Object.values(TrainRunStatus);
export function isTrainRunStatus(type: any) : type is TrainRunStatusType {
    return TrainRunStatusValues.indexOf(type) !== -1;
}
