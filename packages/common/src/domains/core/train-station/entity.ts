/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/common';
import type { Station } from '../station';
import type { Train } from '../train';
import type { TrainStationApprovalStatus, TrainStationRunStatus } from './constants';

export interface TrainStation {
    id: string;

    // ------------------------------------------------------------------

    approval_status: TrainStationApprovalStatus | null;

    run_status: TrainStationRunStatus | null;

    // ------------------------------------------------------------------

    comment: string;

    index: number;

    // ------------------------------------------------------------------

    artifact_tag: string | null;

    artifact_digest: string | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    train_id: Train['id'];

    train: Train;

    train_realm_id: Realm['id'];

    station_id: Station['id'];

    station: Station;

    station_realm_id: Realm['id'];
}
