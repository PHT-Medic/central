/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core';
import type { DomainType } from '../constants';
import type { Proposal } from '../proposal';
import type { Station } from '../station';
import type { DomainEventBaseContext } from '../types-base';
import type { ProposalStationApprovalStatus } from './constants';

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

    station_id: Station['id'];

    station: Station;

    station_realm_id: Realm['id'];
}

export type ProposalStationEventContext = DomainEventBaseContext & {
    type: `${DomainType.PROPOSAL_STATION}`,
    data: ProposalStation
};
