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
    TrainStateStopped,
    TrainStateFinished,
    TrainStateFailed
};

//-----------------------------------------------------------

const TrainResultStateOpen = 'open';
const TrainResultStateDownloading = 'downloading';
const TrainResultStateDownloaded = 'downloaded';
const TrainResultStateExtracting = 'extracting';
const TrainResultStateExtracted = 'extracted';
const TrainResultStateFinished = 'finished';
const TrainResultStateFailed = 'failed';

const TrainResultStates = {
    TrainResultStateOpen,
    TrainResultStateDownloading,
    TrainResultStateDownloaded,
    TrainResultStateExtracting,
    TrainResultStateExtracted,
    TrainResultStateFinished,
    TrainResultStateFailed
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
    TrainResultStates,
    TrainTypes,
    TrainConfiguratorStates
}
