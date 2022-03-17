/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainManagerQueueCommand {
    EXTRACT = 'extract',
    BUILD = 'build',
    ROUTE = 'route',
    STATUS = 'status',
}

export enum TrainManagerBuildingQueueEvent {
    STARTED = 'buildingStarted',

    FINISHED = 'buildingFinished',

    FAILED = 'buildingFailed',
}

export enum TrainManagerRoutingQueueEvent {
    STARTED = 'routerStarted',

    MOVED = 'routerMoved',

    FINISHED = 'routingFinished',

    FAILED = 'routingFailed',
}

export enum TrainManagerExtractingQueueEvent {
    STARTED = 'extractionStarted', // ui trigger

    DOWNLOADING = 'extractionDownloading', // rs trigger
    DOWNLOADED = 'extractionDownloaded', // rs trigger

    PROCESSING = 'extractionProcessing', // rs trigger
    PROCESSED = 'extractionProcessed', // rs trigger

    FINISHED = 'extractionFinished', // ui trigger

    FAILED = 'extractionFailed', // rs trigger,
    UNKNOWN = 'extractionUnknown', // rs trigger
}

export enum TrainManagerExtractionStep {
    DOWNLOAD = 'download',
    EXTRACT = 'extract',
}

export enum TrainManagerExtractionMode {
    READ = 'read',
    WRITE = 'write',
    NONE = 'none',
}
