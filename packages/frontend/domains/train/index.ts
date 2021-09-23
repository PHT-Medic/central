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

export enum TrainResultStatus {
    DOWNLOADING = 'downloading',
    DOWNLOADED = 'downloaded',
    EXTRACTING = 'extracting',
    EXTRACTED = 'extracted',
    FINISHED = 'finished',
    FAILED = 'failed'
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
