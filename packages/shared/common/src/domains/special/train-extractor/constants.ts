/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainExtractorQueueEvent {
    STARTING = 'starting', // ui trigger
    STARTED = 'started', // rs trigger

    STOPPING = 'stopping', // ui trigger
    STOPPED = 'stopped', // rs trigger

    DOWNLOADING = 'downloading', // rs trigger
    DOWNLOADED = 'downloaded', // rs trigger

    EXTRACTING = 'extracting', // rs trigger
    EXTRACTED = 'extracted', // rs trigger

    FAILED = 'failed', // rs trigger,
    UNKNOWN = 'unknown', // rs trigger
}

export enum TrainExtractorStep {
    START = 'start',
    STOP = 'stop',
    DOWNLOAD = 'download',
    EXTRACT = 'extract',
}

export enum TrainExtractorMode {
    READ = 'read',
    WRITE = 'write',
    NONE = 'none',
}
