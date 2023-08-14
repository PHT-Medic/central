/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Proposal,
} from '@personalhealthtrain/core';

import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '../../../middleware';
import {
    createProposalRouteHandler,
    deleteProposalRouteHandler,
    getManyProposalRouteHandler,
    getOneProposalRouteHandler,
    updateProposalRouteHandler,
} from './handlers';

type PartialProposal = Partial<Proposal>;

@DTags('proposal')
@DController('/proposals')
export class ProposalController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposal[]> {
        return await getManyProposalRouteHandler(req, res) as PartialProposal[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposal | undefined> {
        return await getOneProposalRouteHandler(req, res) as PartialProposal | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DPath('id') id: string,
            @DBody() data: Proposal,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposal | undefined> {
        return await updateProposalRouteHandler(req, res) as PartialProposal | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: Proposal,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposal | undefined> {
        return await createProposalRouteHandler(req, res) as PartialProposal | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposal | undefined> {
        return await deleteProposalRouteHandler(req, res) as PartialProposal | undefined;
    }
}
