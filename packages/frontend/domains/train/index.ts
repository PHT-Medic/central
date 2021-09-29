/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

const TrainConfiguratorStateOpen = 'open';
const TrainConfiguratorStateFilesUploaded = 'files_uploaded';
const TrainConfiguratorStateHashGenerated = 'hash_generated';
const TrainConfiguratorStateHashSigned = 'hash_signed';
const TrainConfiguratorStateFinished = 'finished';

const TrainStateConfigured = 'configured';
const TrainStateBuilding = 'building';
const TrainStateBuilt = 'built';
const TrainStateStarting = 'starting';
const TrainStateStarted = 'started';
const TrainStateStopping = 'stopping';
const TrainStateStopped = 'stopped';
const TrainStateFinished = 'finished';
const TrainStateFailed = 'failed';

const TrainConfiguratorStates = {
    TrainConfiguratorStateOpen,
    TrainConfiguratorStateFilesUploaded,
    TrainConfiguratorStateHashGenerated,
    TrainConfiguratorStateHashSigned,
    TrainConfiguratorStateFinished
}

const TrainStates = {
    TrainStateConfigured,
    TrainStateBuilding,
    TrainStateBuilt,
    TrainStateStarting,
    TrainStateStarted,
    TrainStateStopping,
    TrainStateStopped,
    TrainStateFinished,
    TrainStateFailed
};

//-----------------------------------------------------------

export enum TrainBuildStatus {
    STARTING = 'starting',
    STARTED = 'started',

    STOPPING = 'stopping',
    STOPPED = 'stopped',

    FINISHED = 'finished',
    FAILED = 'failed'
}

//-----------------------------------------------------------

export enum TrainConfigurationStatus {
    FILES_UPLOADED = 'files_uploaded',
    HASH_GENERATED = 'hash_generated',
    HASH_SIGNED = 'hash_signed',
    FINISHED = 'finished'
}

//-----------------------------------------------------------

export enum TrainRunStatus {
    STARTING = 'starting',
    STARTED = 'started',
    STOPPING = 'stopping',
    STOPPED = 'stopped',
    FINISHED = 'finished',
    FAILED = 'failed'
}


//-----------------------------------------------------------

const TrainTypeAnalyse = 'analyse';
const TrainTypeDiscovery = 'discovery';

const TrainTypes = {
    TrainTypeAnalyse,
    TrainTypeDiscovery
}

export {
    TrainStates,
    TrainTypes,
    TrainConfiguratorStates
}
