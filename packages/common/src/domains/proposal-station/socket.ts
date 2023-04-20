/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '../constants';
import { buildDomainChannelName } from '../utils';
import type { ProposalStation } from './entity';

export function buildSocketProposalStationRoomName(id?: ProposalStation['id']) {
    return `proposal-stations${id ? `#${id}` : ''}`;
}

export function buildProposalStationChannelNameForIncoming(id?: string | number) {
    return buildDomainChannelName(`${DomainType.PROPOSAL_STATION}-in`, id);
}

export function buildProposalStationChannelNameForOutgoing(id?: string | number) {
    return buildDomainChannelName(`${DomainType.PROPOSAL_STATION}-out`, id);
}
