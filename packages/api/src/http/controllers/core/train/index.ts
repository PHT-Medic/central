/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Train,
    TrainAPICommand,
} from '@personalhealthtrain/central-common';
import {
    DBody, DController, DDelete, DGet, DParam, DPost, DRequest, DResponse,
} from '@routup/decorators';
import { SwaggerTags } from '@trapi/swagger';
import {
    createTrainRouteHandler,
    deleteTrainRouteHandler,
    getManyTrainRouteHandler,
    getOneTrainRouteHandler,
    handleTrainCommandRouteHandler,
    handleTrainFilesDownloadRouteHandler,
    handleTrainResultDownloadRouteHandler,
    updateTrainRouteHandler,
} from './handlers';
import { ForceLoggedInMiddleware } from '../../../middleware';

type PartialTrain = Partial<Train>;

@SwaggerTags('train')
@DController('/trains')
export class TrainController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrain[]> {
        return getManyTrainRouteHandler(req, res);
    }

    @DGet('/:id/files/download', [ForceLoggedInMiddleware])
    async getFiles(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<any> {
        return handleTrainFilesDownloadRouteHandler(req, res);
    }

    @DGet('/:id/result/download', [ForceLoggedInMiddleware])
    async getResult(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<any> {
        return handleTrainResultDownloadRouteHandler(req, res);
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrain | undefined> {
        return getOneTrainRouteHandler(req, res);
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DParam('id') id: string,
            @DBody() data: PartialTrain,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrain | undefined> {
        return updateTrainRouteHandler(req, res);
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: PartialTrain,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrain | undefined> {
        return createTrainRouteHandler(req, res);
    }

    @DPost('/:id/command', [ForceLoggedInMiddleware])
    async doTask(
        @DParam('id') id: string,
            @DBody() data: {
                command: TrainAPICommand
            },
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrain | undefined> {
        return handleTrainCommandRouteHandler(req, res);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrain | undefined> {
        return deleteTrainRouteHandler(req, res);
    }

    // --------------------------------------------------------------------------
}
