/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
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
    handleTrainFilesDownloadRouteHandler,
    uploadTrainFilesRouteHandler,
} from './handlers';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';

type PartialTrainFile = Partial<TrainFile>;

@SwaggerTags('train')
@DController('/trains')
export class TrainFileController {
    @DGet('/:id/files', [ForceLoggedInMiddleware])
    async getMany(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainFile[]> {
        return await getManyTrainFileGetManyRouteHandler(req, res) as PartialTrainFile[];
    }

    @DGet('/:id/files/download', [ForceLoggedInMiddleware])
    async download(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<Buffer> {
        return await handleTrainFilesDownloadRouteHandler(req, res) as Buffer;
    }

    @DGet('/:id/files/:fileId', [ForceLoggedInMiddleware])
    async getOne(
        @DParam('id') id: string,
            @DParam('fileId') fileId: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainFile | undefined> {
        return await getOneTrainFileRouteHandler(req, res) as PartialTrainFile | undefined;
    }

    @DDelete('/:id/files/:fileId', [ForceLoggedInMiddleware])
    async drop(
        @DParam('id') id: string,
            @DParam('fileId') fileId: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainFile | undefined> {
        return await deleteTrainFileRouteHandler(req, res) as PartialTrainFile | undefined;
    }

    @DPost('/:id/files', [ForceLoggedInMiddleware])
    async add(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialTrainFile | undefined> {
        return await uploadTrainFilesRouteHandler(req, res) as PartialTrainFile | undefined;
    }
}
