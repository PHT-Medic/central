/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Proposal } from './entity';

export function buildSocketProposalRoomName(id?: Proposal['id']) {
    return `proposals${id ? `#${id}` : ''}`;
}
