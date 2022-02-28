/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm, User } from '@typescript-auth/domains';
import { Train } from '../train';
import { TrainResultStatus } from './status';

export interface TrainResult {
    id: string;

    image: string;

    status: TrainResultStatus | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    train_id: Train['id'];

    train: Train;

    // ------------------------------------------------------------------

    user_id: User['id'];

    user: User;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    realm: Realm;
}
