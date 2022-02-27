/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ProposalStation,
} from '@personalhealthtrain/central-common';
import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';

import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    createProposalStationRouteHandler,
    deleteProposalStationRouteHandler,
    getManyProposalStationRouteHandler,
    getOneProposalStationRouteHandler,
    updateProposalStationRouteHandler,
} from './handlers';

type PartialProposalStation = Partial<ProposalStation>;

@SwaggerTags('proposal', 'station')
@Controller('/proposal-stations')
export class ProposalStationController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposalStation[]> {
        return getManyProposalStationRouteHandler(req, res);
    }

    @Post('', [ForceLoggedInMiddleware])
    async add(
        @Body() data: Pick<ProposalStation, 'station_id' | 'proposal_id'>,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposalStation | undefined> {
        return createProposalStationRouteHandler(req, res);
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposalStation | undefined> {
        return getOneProposalStationRouteHandler(req, res);
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async edit(
        @Params('id') id: string,
            @Body() data: Pick<ProposalStation, 'comment' | 'approval_status'>,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposalStation | undefined> {
        return updateProposalStationRouteHandler(req, res);
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialProposalStation | undefined> {
        return deleteProposalStationRouteHandler(req, res);
    }
}
