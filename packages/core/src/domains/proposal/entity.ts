/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, User } from '@authup/core';
import type { DomainType } from '../constants';
import type { MasterImage } from '../master-image';
import type { DomainEventBaseContext } from '../types-base';
import type { ProposalRisk } from './constants';

export interface Proposal {
    id: string;

    title: string;

    requested_data: string;

    risk: ProposalRisk;

    risk_comment: string;

    trains: number;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    user_id: User['id'];

    master_image_id: MasterImage['id'] | null;

    master_image: MasterImage | null;
}

export type ProposalEventContext = DomainEventBaseContext & {
    type: `${DomainType.PROPOSAL}`,
    data: Proposal
};
