/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainManagerBuilderEvent {
    BUILDING = 'building',
    BUILT = 'built',

    PUSHING = 'pushing',
    PUSHED = 'pushed',

    CHECKING = 'checking',
    CHECKED = 'checked',

    FAILED = 'failed',

    NONE = 'none',
}

export enum TrainManagerBuilderCommand {
    BUILD = 'build',
    CHECK = 'check',
}

export enum TrainManagerBuilderErrorCode {
    TRAIN_NOT_BUILD = 'trainNotBuild',
    ENTRYPOINT_NOT_FOUND = 'entrypointNotFound',
    MASTER_IMAGE_NOT_FOUND = 'masterImageNotFound',
    UNKNOWN = 'unknown',
}
