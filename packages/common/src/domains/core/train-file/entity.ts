/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm, User } from '@typescript-auth/domains';
import { Train } from '../train';

export interface TrainFile {
    id: string;

    name: string;

    hash: string;

    directory: string | null;

    size: number | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    user_id: string;

    user: User;

    train_id: string;

    train: Train;

    realm_id: string;

    realm: Realm;
}
