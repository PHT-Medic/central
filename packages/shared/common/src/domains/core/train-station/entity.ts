/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm } from '@typescript-auth/domains';
import { Station } from '../station';
import { Train } from '../train';
import { TrainStationApprovalStatus, TrainStationRunStatus } from './constatnts';

export interface TrainStation {
    id: string;

    // ------------------------------------------------------------------

    approval_status: TrainStationApprovalStatus | null;

    run_status: TrainStationRunStatus | null;

    // ------------------------------------------------------------------

    comment: string;

    position: number;

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

    train_realm: Realm;

    station_id: Station['id'];

    station: Station;

    station_realm_id: Realm['id'];

    station_realm: Realm;
}
