/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Train,
    TrainManagerComponent,
} from '@personalhealthtrain/central-common';

export type TrainLogSaveContext = {
    train: Pick<Train, 'id'> &
    Partial<Pick<Train, 'realm_id' | 'run_station_index' | 'run_station_id'>>,

    error?: boolean,
    errorCode?: string,

    component?: `${TrainManagerComponent}`,
    command?: string,
    event?: string,
    step?: string,

    status?: string,
    statusMessage?: string
};
