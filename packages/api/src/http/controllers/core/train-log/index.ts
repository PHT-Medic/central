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
    DController, DDelete, DGet, DParam, DRequest, DResponse,
} from '@routup/decorators';
import { SwaggerTags } from '@trapi/swagger';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    deleteTrainLogRouteHandler,
    getManyTrainLogRouteHandler,
    getOneTrainLogRouteHandler,
} from './handlers';

type PartialTrainLog = Partial<TrainLog>;

@SwaggerTags('train')
@DController('/train-logs')
export class TrainLogController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainLog[]> {
        return await getManyTrainLogRouteHandler(req, res) as PartialTrainLog[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainLog | undefined> {
        return await getOneTrainLogRouteHandler(req, res) as PartialTrainLog | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainLog | undefined> {
        return await deleteTrainLogRouteHandler(req, res) as PartialTrainLog | undefined;
    }
}
