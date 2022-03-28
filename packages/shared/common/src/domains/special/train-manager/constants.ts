/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainManagerBaseErrorCode {
    NOT_FOUND = 'notFound',
    REGISTRY_NOT_FOUND = 'registryNotFound',
    REGISTRY_PROJECT_NOT_FOUND = 'registryProjectNotFound',
    UNKNOWN = 'unknown',
}

export enum TrainManagerQueueCommand {
    EXTRACT = 'extract',
    EXTRACT_STATUS = 'extract_status',

    BUILD = 'build',
    BUILD_STATUS = 'buildStatus',

    ROUTE = 'route',
    ROUTE_START = 'routeStart',
    ROUTE_STATUS = 'routeStatus',
}

// ----------------------------------------------------------

export enum TrainManagerBuildingQueueEvent {
    STARTED = 'buildingStarted',

    FINISHED = 'buildingFinished',

    FAILED = 'buildingFailed',

    NONE = 'buildingNone', // rs trigger
}

export enum TrainManagerBuildingErrorCode {
    TRAIN_NOT_BUILD = 'trainNotBuild',
    ENTRYPOINT_NOT_FOUND = 'entrypointNotFound',
    MASTER_IMAGE_NOT_FOUND = 'masterImageNotFound',
    UNKNOWN = 'unknown',
}

export enum TrainManagerBuildingStep {
    START = 'start',
    BUILD = 'build',
    UNKNOWN = 'unknown',
}

// ----------------------------------------------------------

export enum TrainManagerRoutingQueueEvent {
    STARTED = 'routingStarted',

    MOVE_STARTED = 'routingMoveStarted',
    MOVE_FINISHED = 'routingMoveFinished',

    POSITION_FOUND = 'routingPositionFound',
    POSITION_NOT_FOUND = 'routingPositionNotFound',

    FINISHED = 'routingFinished',

    FAILED = 'routingFailed',
}

export enum TrainManagerRoutingErrorCode {
    TRAIN_NOT_BUILD = 'trainNotBuild',
    ROUTE_EMPTY = 'routeEmpty',
    OPERATOR_INVALID = 'operatorInvalid',
    UNKNOWN = 'unknown',
}

export enum TrainManagerRoutingStep {
    START = 'start',
    ROUTE = 'route',
    STATUS = 'status',
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

export enum TrainManagerExtractingErrorCode {
    UNKNOWN = 'unknown',
}

export enum TrainManagerExtractingStep {
    DOWNLOAD = 'download',
    EXTRACT = 'extract',
    STATUS = 'status',
    UNKNOWN = 'unknown',
}

export enum TrainManagerExtractingMode {
    READ = 'read',
    WRITE = 'write',
    NONE = 'none',
}
