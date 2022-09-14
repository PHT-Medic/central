/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainLog,
} from '@personalhealthtrain/central-common';

import {
    Controller, Delete, Get, Params, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    deleteTrainLogRouteHandler,
    getManyTrainLogRouteHandler,
    getOneTrainLogRouteHandler,
} from './handlers';

type PartialTrainLog = Partial<TrainLog>;

@SwaggerTags('train')
@Controller('/train-logs')
export class TrainLogController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainLog[]> {
        return await getManyTrainLogRouteHandler(req, res) as PartialTrainLog[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainLog | undefined> {
        return await getOneTrainLogRouteHandler(req, res) as PartialTrainLog | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainLog | undefined> {
        return await deleteTrainLogRouteHandler(req, res) as PartialTrainLog | undefined;
    }
}
