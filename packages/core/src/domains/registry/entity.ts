/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainType } from '../constants';
import type { Ecosystem } from '../ecosystem';
import type { Proposal } from '../proposal';
import type { DomainEventBaseContext } from '../types-base';

export interface Registry {
    id: string;

    name: string;

    host: string;

    ecosystem: Ecosystem;

    // ------------------------------------------------------------------

    account_name: string | null;

    account_secret: string | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}

export type RegistryEventContext = DomainEventBaseContext & {
    type: `${DomainType.REGISTRY}`,
    data: Registry
};
