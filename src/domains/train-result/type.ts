export enum TrainResultEvent {
    STARTING = 'starting', // ui trigger
    STARTED = 'started', // rs trigger

    STOPPING = 'stopping', // ui trigger
    STOPPED = 'stopped', // rs trigger

    DOWNLOADING = 'downloading', // rs trigger
    DOWNLOADED = 'downloaded', // rs trigger

    EXTRACTING = 'extracting', // rs trigger
    EXTRACTED = 'extracted', // rs trigger

    FAILED = 'failed' // rs trigger
}

export enum TrainResultStep {
    START = 'start',
    STOP = 'stop',
    DOWNLOAD = 'download',
    EXTRACT = 'extract'
}
