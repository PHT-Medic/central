/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm, User } from '@typescript-auth/domains';
import { MasterImage } from '../master-image';
import { ProposalStation } from '../proposal-station';
import { ProposalRisk } from './constants';

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

    realm: Realm;

    user_id: User['id'];

    user: User;

    master_image_id: MasterImage['id'] | null;

    master_image: MasterImage | null;

    proposal_stations: ProposalStation[];
}
