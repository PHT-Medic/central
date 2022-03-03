/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Realm } from '@typescript-auth/domains';
import { Proposal } from '../proposal';
import { Station } from '../station';
import { ProposalStationApprovalStatus } from './constants';

export interface ProposalStation {
    id: string;

    approval_status: ProposalStationApprovalStatus | null;

    comment: string | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    proposal_id: Proposal['id'];

    proposal: Proposal;

    proposal_realm_id: Realm['id'];

    proposal_realm: Realm;

    station_id: Station['id'];

    station: Station;

    station_realm_id: Realm['id'];

    station_realm: Realm;
}
