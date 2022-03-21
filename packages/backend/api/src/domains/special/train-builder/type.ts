/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Train, TrainBuilderStation, TrainRunStatus,
} from '@personalhealthtrain/central-common';

export enum TrainBuilderCommand {
    START = 'trainBuildStart',
    STOP = 'trainBuildStop',
    STATUS = 'trainBuildStatus',
    META_BUILD = 'trainMetaBuild',
}

export type TrainBuilderMetaPayload = {
    id: Train['id'],
    runStatus: TrainRunStatus | null,
    runStationId: Train['run_station_id'],
    runStationIndex: Train['run_station_index'],

    stations: TrainBuilderStation[],
};
