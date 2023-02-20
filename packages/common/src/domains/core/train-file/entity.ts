/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, User } from '@authup/common';
import type { Train } from '../train';

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

    user_id: User['id'];

    user: User;

    train_id: Train['id'];

    train: Train;

    realm_id: Realm['id'];

    realm: Realm;
}
