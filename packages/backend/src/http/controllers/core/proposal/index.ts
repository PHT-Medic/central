/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Proposal,
} from '@personalhealthtrain/ui-common';

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    createProposalRouteHandler,
    deleteProposalRouteHandler,
    getManyProposalRouteHandler,
    getOneProposalRouteHandler,
    updateProposalRouteHandler,
} from './handlers';

type PartialProposal = Partial<Proposal>;

@SwaggerTags('pht')
@Controller('/proposals')
export class ProposalController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposal[]> {
        return await getManyProposalRouteHandler(req, res) as PartialProposal[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposal | undefined> {
        return await getOneProposalRouteHandler(req, res) as PartialProposal | undefined;
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async update(
        @Params('id') id: string,
            @Body() data: Proposal,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposal | undefined> {
        return await updateProposalRouteHandler(req, res) as PartialProposal | undefined;
    }

    @Post('', [ForceLoggedInMiddleware])
    async add(
        @Body() data: Proposal,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposal | undefined> {
        return await createProposalRouteHandler(req, res) as PartialProposal | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposal | undefined> {
        return await deleteProposalRouteHandler(req, res) as PartialProposal | undefined;
    }
}
