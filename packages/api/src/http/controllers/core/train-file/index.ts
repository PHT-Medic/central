/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    TrainFile,
} from '@personalhealthtrain/central-common';
import {
    DController, DDelete, DGet, DParam, DPost, DRequest, DResponse,
} from '@routup/decorators';
import { SwaggerTags } from '@trapi/swagger';

import {
    deleteTrainFileRouteHandler,
    getManyTrainFileGetManyRouteHandler,
    getOneTrainFileRouteHandler,
    uploadTrainFilesRouteHandler,
} from './handlers';
import { ForceLoggedInMiddleware } from '../../../middleware';

type PartialTrainFile = Partial<TrainFile>;

@SwaggerTags('train')
@DController('/train-files')
export class TrainFileController {
    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainFile | undefined> {
        return await getOneTrainFileRouteHandler(req, res) as PartialTrainFile | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainFile | undefined> {
        return await deleteTrainFileRouteHandler(req, res) as PartialTrainFile | undefined;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainFile[]> {
        return await getManyTrainFileGetManyRouteHandler(req, res) as PartialTrainFile[];
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<any> {
        return await uploadTrainFilesRouteHandler(req, res) as any;
    }
}
