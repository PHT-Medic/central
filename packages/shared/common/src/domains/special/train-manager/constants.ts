/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainManagerQueueCommand {
    EXTRACT = 'extract',
    EXTRACT_STATUS = 'extract_status',

    BUILD = 'build',
    BUILD_STATUS = 'buildStatus',

    ROUTE = 'route',
    ROUTE_START = 'routeStart',
}

// ----------------------------------------------------------

export enum TrainManagerBuildingQueueEvent {
    STARTED = 'buildingStarted',

    FINISHED = 'buildingFinished',

    FAILED = 'buildingFailed',

    NONE = 'buildingNone', // rs trigger
}

export enum TrainManagerBuildingErrorType {
    TRAIN_NOT_BUILD = 'trainNotBuild',
    UNKNOWN = 'unknown',
}

export enum TrainManagerBuildingStep {
    START = 'start',
    BUILD = 'build',
    UNKNOWN = 'unknown',
}

// ----------------------------------------------------------

export enum TrainManagerRoutingQueueEvent {
    STARTED = 'routerStarted',

    MOVE_STARTED = 'routerMoveStarted',
    MOVE_FINISHED = 'routerMoveFinished',

    FINISHED = 'routingFinished',

    FAILED = 'routingFailed',
}

export enum TrainManagerRoutingErrorType {
    TRAIN_NOT_BUILD = 'trainNotBuild',
    UNKNOWN = 'unknown',
}

export enum TrainManagerRoutingStep {
    START = 'start',
    MOVE = 'move',
    UNKNOWN = 'unknown',
}

// ----------------------------------------------------------

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
