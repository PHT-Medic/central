/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core';
import type { DomainType } from '../constants';
import type { Registry } from '../registry';
import type { Ecosystem } from '../ecosystem';
import type { DomainEventBaseContext } from '../types-base';
import type { RegistryProjectType } from './constants';

export interface RegistryProject {
    id: string;

    name: string;

    ecosystem: `${Ecosystem}`;

    type: `${RegistryProjectType}`;

    public: boolean;

    // ------------------------------------------------------------------

    // a-z0-9-_ {0,255}
    external_name: string;

    external_id: string | null;

    // ------------------------------------------------------------------

    account_id: string | null;

    account_name: string | null;

    account_secret: string | null;

    // ------------------------------------------------------------------

    webhook_name: string | null;

    webhook_exists: boolean | null;

    // ------------------------------------------------------------------

    registry_id: Registry['id'];

    registry: Registry;

    // ------------------------------------------------------------------

    realm_id: Realm['id'] | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}

export type RegistryProjectEventContext = DomainEventBaseContext & {
    type: `${DomainType.REGISTRY_PROJECT}`,
    data: RegistryProject
};
