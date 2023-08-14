/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum BuilderEvent {
    BUILDING = 'building',
    BUILT = 'built',

    PUSHING = 'pushing',
    PUSHED = 'pushed',

    CHECKING = 'checking',
    CHECKED = 'checked',

    FAILED = 'failed',

    NONE = 'none',
}

export enum BuilderCommand {
    BUILD = 'build',
    CHECK = 'check',
}

export enum BuilderErrorCode {
    TRAIN_NOT_BUILD = 'trainNotBuild',
    ENTRYPOINT_NOT_FOUND = 'entrypointNotFound',
    MASTER_IMAGE_NOT_FOUND = 'masterImageNotFound',
    UNKNOWN = 'unknown',
}
