/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainStation,
} from '@personalhealthtrain/central-common';

import {
    DBody, DController, DDelete, DGet, DParam, DPost, DRequest, DResponse,
} from '@routup/decorators';
import { SwaggerTags } from '@trapi/swagger';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    createTrainStationRouteHandler, deleteTrainStationRouteHandler,
    getManyTrainStationRouteHandler,
    getOneTrainStationRouteHandler,
    updateTrainStationRouteHandler,
} from './handlers';

type PartialTrainStation = Partial<TrainStation>;

@SwaggerTags('train', 'station')
@DController('/train-stations')
export class TrainStationController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainStation[]> {
        return await getManyTrainStationRouteHandler(req, res) as PartialTrainStation[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainStation | undefined> {
        return await getOneTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DParam('id') id: string,
            @DBody() data: TrainStation,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainStation | undefined> {
        return await updateTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: PartialTrainStation,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainStation | undefined> {
        return await createTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainStation | undefined> {
        return await deleteTrainStationRouteHandler(req, res) as PartialTrainStation | undefined;
    }
}
