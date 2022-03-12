/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm } from '@authelion/common';
import { Ecosystem } from '../ecosystem';

export interface Station {
    id: string;

    secure_id: string;

    name: string;

    public_key: string | null;

    email: string | null;

    ecosystem: Ecosystem | null;

    hidden: boolean;

    // ------------------------------------------------------------------

    registry_project_id: number | null;

    registry_project_account_id: number | null;

    registry_project_account_name: string | null;

    registry_project_account_token: string | null;

    registry_project_webhook_exists: boolean;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    realm: Realm;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}
