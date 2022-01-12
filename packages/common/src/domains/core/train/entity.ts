/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm, User } from '@typescript-auth/domains';
import { MasterImage } from '../master-image';
import { Proposal } from '../proposal';
import { TrainFile } from '../train-file';
import { TrainResultStatus } from '../train-result';
import { TrainStation } from '../train-station';
import {
    TrainBuildErrorCode,
    TrainBuildStatus,
    TrainConfigurationStatus,
    TrainRunErrorCode,
    TrainRunStatus,
} from './constants';

export interface Train {
    id: string;

    type: string;

    name: string | null;

    query: string | null;

    hash: string | null;

    hash_signed: string | null;

    session_id: string | null;

    entrypoint_file_id: number | string;

    entrypoint_file: TrainFile;

    stations: number;

    // ------------------------------------------------------------------

    configuration_status: TrainConfigurationStatus | null;

    // ------------------------------------------------------------------

    build_status: TrainBuildStatus | null;

    build_id: string | null;

    build_error_code: TrainBuildErrorCode | null;

    // ------------------------------------------------------------------

    run_status: TrainRunStatus | null;

    run_station_id: number | null;

    run_station_index: number | null;

    run_error_code: TrainRunErrorCode | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    realm_id: string;

    realm: Realm;

    user_id: string;

    user: User;

    // ------------------------------------------------------------------

    result_last_id: string;

    result_last_status: TrainResultStatus | null;

    // ------------------------------------------------------------------
    proposal_id: number;

    proposal: Proposal;

    // ------------------------------------------------------------------

    train_stations: TrainStation[];

    // ------------------------------------------------------------------

    master_image_id: string | null;

    master_image: MasterImage;
}
