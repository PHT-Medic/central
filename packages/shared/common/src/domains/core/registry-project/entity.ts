/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm } from '@authelion/common';
import { Registry } from '../registry';
import { Ecosystem } from '../ecosystem';

export interface RegistryProject {
    id: string;

    alias: string;

    name: string;

    ecosystem: Ecosystem;

    ecosystem_aggregator: boolean;

    // ------------------------------------------------------------------

    external_id: string | null;

    // ------------------------------------------------------------------

    account_id: string | null;

    account_name: string | null;

    account_token: string | null;

    // ------------------------------------------------------------------

    webhook_exists: boolean | null;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    realm: Realm;

    // ------------------------------------------------------------------

    registry_id: Registry['id'];

    registry: Registry;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}
