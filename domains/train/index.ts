const TrainStateCreated = 'created';
const TrainStateHashGenerated = 'hash_generated';
const TrainStateHashSigned = 'hash_signed';
const TrainStateRunning = 'running';
const TrainStateStopped = 'stopped';
const TrainStateFinished = 'finished';

const TrainStates = {
    TrainStateCreated,
    TrainStateHashGenerated,
    TrainStateHashSigned,
    TrainStateRunning,
    TrainStateStopped,
    TrainStateFinished
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
    TrainTypes
}
