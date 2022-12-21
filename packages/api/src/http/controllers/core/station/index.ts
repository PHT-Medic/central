/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Station,
} from '@personalhealthtrain/central-common';
import {
    DBody, DController, DDelete, DGet, DParam, DPost, DRequest, DResponse,
} from '@routup/decorators';
import { SwaggerTags } from '@trapi/swagger';

import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    createStationRouteHandler,
    deleteStationRouteHandler,
    getManyStationRouteHandler,
    getOneStationRouteHandler,
    updateStationRouteHandler,
} from './handlers';

type PartialStation = Partial<Station>;

@SwaggerTags('station')
@DController('/stations')
export class StationController {
    @DGet('', [ForceLoggedInMiddleware])

    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialStation[]> {
        return await getManyStationRouteHandler(req, res) as PartialStation[];
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: PartialStation,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialStation | undefined> {
        return await createStationRouteHandler(req, res) as PartialStation | undefined;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialStation | undefined> {
        return await getOneStationRouteHandler(req, res) as PartialStation | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DParam('id') id: string,
            @DBody() data: PartialStation,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialStation | undefined> {
        return await updateStationRouteHandler(req, res) as PartialStation | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialStation | undefined> {
        return await deleteStationRouteHandler(req, res) as PartialStation | undefined;
    }
}
