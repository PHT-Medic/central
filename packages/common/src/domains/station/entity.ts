/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core';
import type { DomainType } from '../constants';
import type { Ecosystem } from '../ecosystem';
import type { RegistryProject } from '../registry-project';
import type { Registry } from '../registry';
import type { DomainEventBaseContext } from '../types-base';

export interface Station {
    id: string;

    external_name: string | null;

    name: string;

    public_key: string | null;

    email: string | null;

    ecosystem: Ecosystem | null;

    hidden: boolean;

    // ------------------------------------------------------------------

    registry_id: Registry['id'];

    registry: Registry;

    registry_project_id: RegistryProject['id'] | null;

    registry_project: RegistryProject;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}

export type StationEventContext = DomainEventBaseContext & {
    type: `${DomainType.STATION}`,
    data: Station
};
