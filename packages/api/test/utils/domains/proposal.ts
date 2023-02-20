/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Proposal } from '@personalhealthtrain/central-common';
import { ProposalRisk } from '@personalhealthtrain/central-common';
import type { SuperTest, Test } from 'supertest';

export const TEST_DEFAULT_PROPOSAL : Partial<Proposal> = {
    title: 'development',
    requested_data: 'I request everything and more :P',
    risk_comment: 'There is no risk at all :) ^^',
    risk: ProposalRisk.LOW,
};

export async function createSuperTestProposal(superTest: SuperTest<Test>, proposal?: Partial<Proposal>) {
    return superTest
        .post('/proposals')
        .send({
            ...TEST_DEFAULT_PROPOSAL,
            ...(proposal || {}),
        })
        .auth('admin', 'start123');
}
