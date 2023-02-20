/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ProposalStation,
} from '@personalhealthtrain/central-common';
import {
    DBody, DController, DDelete, DGet, DParam, DPost, DRequest, DResponse,
} from '@routup/decorators';
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
@DController('/proposal-stations')
export class ProposalStationController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposalStation[]> {
        return getManyProposalStationRouteHandler(req, res);
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: Pick<ProposalStation, 'station_id' | 'proposal_id'>,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposalStation | undefined> {
        return createProposalStationRouteHandler(req, res);
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposalStation | undefined> {
        return getOneProposalStationRouteHandler(req, res);
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DParam('id') id: string,
            @DBody() data: Pick<ProposalStation, 'comment' | 'approval_status'>,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposalStation | undefined> {
        return updateProposalStationRouteHandler(req, res);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposalStation | undefined> {
        return deleteProposalStationRouteHandler(req, res);
    }
}
