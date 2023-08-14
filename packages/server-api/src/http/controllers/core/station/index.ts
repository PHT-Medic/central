/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Station,
} from '@personalhealthtrain/core';
import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';

import { ForceLoggedInMiddleware } from '../../../middleware';
import {
    createStationRouteHandler,
    deleteStationRouteHandler,
    getManyStationRouteHandler,
    getOneStationRouteHandler,
    updateStationRouteHandler,
} from './handlers';

type PartialStation = Partial<Station>;

@DTags('station')
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
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialStation | undefined> {
        return await getOneStationRouteHandler(req, res) as PartialStation | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
            @DBody() data: PartialStation,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialStation | undefined> {
        return await updateStationRouteHandler(req, res) as PartialStation | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialStation | undefined> {
        return await deleteStationRouteHandler(req, res) as PartialStation | undefined;
    }
}
