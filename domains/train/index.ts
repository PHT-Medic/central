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

const TrainTypeAnalyse = 'analyse';
const TrainTypeDiscovery = 'discovery';

const TrainTypes = {
    TrainTypeAnalyse,
    TrainTypeDiscovery
}

export {
    TrainStates,
    TrainTypes
}
