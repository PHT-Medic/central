/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainResult,
} from '@personalhealthtrain/ui-common';

import {
    Controller, Delete, Get, Params, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    deleteTrainResultRouteHandler,
    getManyTrainResultRouteHandler,
    getOneTrainResultRouteHandler,
} from './handlers';

type PartialTrainResult = Partial<TrainResult>;

@SwaggerTags('pht')
@Controller('/train-results')
export class TrainResultController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainResult[]> {
        return await getManyTrainResultRouteHandler(req, res) as PartialTrainResult[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainResult | undefined> {
        return await getOneTrainResultRouteHandler(req, res) as PartialTrainResult | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainResult | undefined> {
        return await deleteTrainResultRouteHandler(req, res) as PartialTrainResult | undefined;
    }
}
