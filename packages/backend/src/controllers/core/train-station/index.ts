/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainStation,
} from '@personalhealthtrain/ui-common';

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import { ForceLoggedInMiddleware } from '../../../config/http/middleware/auth';
import {
    createTrainStationRouteHandler, deleteTrainStationRouteHandler,
    getManyTrainStationRouteHandler,
    getOneTrainStationRouteHandler,
    updateTrainStationRouteHandler,
} from './handlers';

type PartialTrainStation = Partial<TrainStation>;

@SwaggerTags('pht')
@Controller('/train-stations')
export class TrainStationController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainStation[]> {
        return await getManyTrainStationRouteHandler(req, res) as PartialTrainStation[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainStation | undefined> {
        return await getOneTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async edit(
        @Params('id') id: string,
            @Body() data: TrainStation,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainStation | undefined> {
        return await updateTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @Post('', [ForceLoggedInMiddleware])
    async add(
        @Body() data: Pick<TrainStation, 'station_id' | 'train_id' | 'comment' | 'position' | 'approval_status'>,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainStation | undefined> {
        return await createTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainStation | undefined> {
        return await deleteTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }
}
