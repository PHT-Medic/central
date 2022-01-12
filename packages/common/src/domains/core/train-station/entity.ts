/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm } from '@typescript-auth/domains';
import { Station } from '../station';
import { Train } from '../train';
import { TrainStationApprovalStatus, TrainStationRunStatus } from './status';

export interface TrainStation {
    id: string;

    // ------------------------------------------------------------------

    approval_status: TrainStationApprovalStatus | null;

    run_status: TrainStationRunStatus | null;

    // ------------------------------------------------------------------

    comment: string;

    position: number;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    train_id: string;

    train: Train;

    train_realm_id: string;

    train_realm: Realm;

    station_id: number;

    station: Station;

    station_realm_id: string;

    station_realm: Realm;
}
