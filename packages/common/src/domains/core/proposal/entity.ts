/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm, User } from '@typescript-auth/domains';
import { MasterImage } from '../master-image';
import { ProposalStation } from '../proposal-station';

export interface Proposal {
    id: number;

    title: string;

    requested_data: string;

    risk: string;

    risk_comment: string;

    trains: number;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    realm_id: string;

    realm: Realm;

    user_id: string;

    user: User;

    master_image_id: string | null;

    master_image: MasterImage;

    proposal_stations: ProposalStation[];
}
