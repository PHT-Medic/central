/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum TrainType {
    ANALYSE = 'analyse',
    DISCOVERY = 'discovery'
}

export enum TrainCommand {
    BUILD_START = 'buildStart',
    BUILD_STOP = 'buildStop',
    BUILD_STATUS = 'buildStatus',

    RUN_START = 'runStart',
    RUN_STOP = 'runStop',
    RUN_STATUS = 'runStatus',

    RESULT_STATUS = 'resultStatus',
    RESULT_START = 'resultStart',
    RESULT_STOP = 'resultStop',

    GENERATE_HASH = 'generateHash',

}
