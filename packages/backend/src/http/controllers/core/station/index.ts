/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Station,
} from '@personalhealthtrain/ui-common';
import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
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

@SwaggerTags('pht')
@Controller('/stations')
export class StationController {
    @Get('', [ForceLoggedInMiddleware])

    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialStation[]> {
        return await getManyStationRouteHandler(req, res) as PartialStation[];
    }

    @Post('', [ForceLoggedInMiddleware])
    async add(
        @Body() data: PartialStation,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialStation | undefined> {
        return await createStationRouteHandler(req, res) as PartialStation | undefined;
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialStation | undefined> {
        return await getOneStationRouteHandler(req, res) as PartialStation | undefined;
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async edit(
        @Params('id') id: string,
            @Body() data: PartialStation,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialStation | undefined> {
        return await updateStationRouteHandler(req, res) as PartialStation | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialStation | undefined> {
        return await deleteStationRouteHandler(req, res) as PartialStation | undefined;
    }
}
