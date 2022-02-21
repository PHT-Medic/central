/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProposalStation } from './entity';

export function buildSocketProposalStationRoomName(id?: ProposalStation['id']) {
    return `proposal-stations${id ? `#${id}` : ''}`;
}

export function buildSocketProposalStationInRoomName(id?: ProposalStation['id']) {
    return `proposal-stations-in${id ? `#${id}` : ''}`;
}

export function buildSocketProposalStationOutRoomName(id?: ProposalStation['id']) {
    return `proposal-stations-out${id ? `#${id}` : ''}`;
}
