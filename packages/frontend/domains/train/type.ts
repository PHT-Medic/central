/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainCommand {
    BUILD_START = 'buildStart',
    BUILD_STOP = 'buildStop',
    BUILD_STATUS = 'buildStatus',

    RUN_STATUS = 'runStatus',
    RUN_START = 'runStart',
    RUN_STOP = 'runStop',

    RESULT_STATUS = 'resultStatus',
    RESULT_START = 'resultStart',
    RESULT_STOP = 'resultStop',

    // special command
    RESULT_DOWNLOAD = 'resultDownload',

    GENERATE_HASH = 'generateHash'
}
