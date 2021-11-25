/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainResultStatus {
    STARTING = 'starting',
    STARTED = 'started',

    STOPPING = 'stopping',
    STOPPED = 'stopped',

    DOWNLOADING = 'downloading',
    DOWNLOADED = 'downloaded',

    EXTRACTING = 'extracting',
    EXTRACTED = 'extracted',

    FINISHED = 'finished',
    FAILED = 'failed',
}

export type TrainResultStatusType = `${TrainResultStatus}`;
