/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm } from '@authelion/common';
import {
    Train,
} from '../train';

export interface TrainLog {
    id: string;

    /**
     * e.g: building, routing, ...
     */
    component: string | null;

    /**
     * e.g: process, check, stop, ...
     */
    command: string | null;

    /**
     * e.g: init, ...
     */
    step: string | null;

    error: boolean;

    /**
     * e.g: trainNotBuild, entrypointNotFound, ...
     */
    error_code: string | null;

    /**
     * e.g. started, finished, failed, ...
     */
    status: string | null;

    /**
     * e.g: error_message
     */
    status_message: string | null;

    /**
     * e.g: {station_id: xxx, station_index: 0}
     */
    meta: string | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    train_id: Train['id'];

    train: Train;

    realm_id: Realm['id'];

    realm: Realm;
}
