/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    TrainLog,
} from '@personalhealthtrain/central-common';

import {
    DController, DDelete, DGet, DPath, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '../../../middleware';
import {
    deleteTrainLogRouteHandler,
    getManyTrainLogRouteHandler,
    getOneTrainLogRouteHandler,
} from './handlers';

type PartialTrainLog = Partial<TrainLog>;

@DTags('train')
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
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainLog | undefined> {
        return await getOneTrainLogRouteHandler(req, res) as PartialTrainLog | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainLog | undefined> {
        return await deleteTrainLogRouteHandler(req, res) as PartialTrainLog | undefined;
    }
}
