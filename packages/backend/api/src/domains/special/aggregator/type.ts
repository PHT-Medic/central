/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Station, TrainStationRunStatus } from '@personalhealthtrain/central-common';

export type AggregatorTrainEventPayload = {
    id: string,
    stationId?: Station['id'],
    stationIndex?: number,
    status?: TrainStationRunStatus,
    artifactTag?: string,
    artifactDigest?: string
};
