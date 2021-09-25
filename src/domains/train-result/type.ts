export enum TrainResultEvent {
    FAILED = 'failed',

    DOWNLOADING = 'downloading',
    DOWNLOADED = 'downloaded',
    DOWNLOADING_FAILED = 'downloadingFailed',

    EXTRACTING = 'extracting',
    EXTRACTED = 'extracted',
    EXTRACTING_FAILED = 'extractingFailed',
}

export enum TrainResultStep {
    DOWNLOAD = 'download',
    EXTRACT = 'extract'
}
