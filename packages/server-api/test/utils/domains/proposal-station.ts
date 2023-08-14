/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProposalStation } from '@personalhealthtrain/core';
import type { SuperTest, Test } from 'supertest';

export async function createSuperTestProposalStation(superTest: SuperTest<Test>, proposalStation: Partial<ProposalStation>) {
    return superTest
        .post('/proposal-stations')
        .send(proposalStation)
        .auth('admin', 'start123');
}
