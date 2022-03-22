/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm } from '@authelion/common';
import { Ecosystem } from '../ecosystem';

export interface Registry {
    id: string;

    name: string;

    address: string;

    ecosystem: Ecosystem;

    // ------------------------------------------------------------------

    account_name: string | null;

    account_secret: string | null;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    realm: Realm;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}
