/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Train,
    TrainCommand,
} from '@personalhealthtrain/central-common';
import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import {
    createTrainRouteHandler,
    deleteTrainRouteHandler,
    getManyTrainRouteHandler,
    getOneTrainRouteHandler,
    handleTrainCommandRouteHandler,
    updateTrainRouteHandler,
} from './handlers';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';

type PartialTrain = Partial<Train>;

@SwaggerTags('train')
@Controller('/trains')
export class TrainController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrain[]> {
        return getManyTrainRouteHandler(req, res);
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrain | undefined> {
        return getOneTrainRouteHandler(req, res);
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async edit(
        @Params('id') id: string,
            @Body() data: PartialTrain,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrain | undefined> {
        return updateTrainRouteHandler(req, res);
    }

    @Post('', [ForceLoggedInMiddleware])
    async add(
        @Body() data: PartialTrain,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrain | undefined> {
        return createTrainRouteHandler(req, res);
    }

    @Post('/:id/command', [ForceLoggedInMiddleware])
    async doTask(
        @Params('id') id: string,
            @Body() data: {
                command: TrainCommand
            },
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrain | undefined> {
        return handleTrainCommandRouteHandler(req, res);
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrain | undefined> {
        return deleteTrainRouteHandler(req, res);
    }

    // --------------------------------------------------------------------------
}
