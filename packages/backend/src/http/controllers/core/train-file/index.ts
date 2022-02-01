/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainFile,
} from '@personalhealthtrain/ui-common';
import {
    Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';

import {
    deleteTrainFileRouteHandler,
    getManyTrainFileGetManyRouteHandler,
    getOneTrainFileRouteHandler,
    streamTrainFileRouteHandler,
    uploadTrainFilesRouteHandler,
} from './handlers';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';

type PartialTrainFile = Partial<TrainFile>;

@SwaggerTags('pht')
@Controller('/trains')
export class TrainFileController {
    @Get('/:id/files', [ForceLoggedInMiddleware])
    async getMany(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainFile[]> {
        return await getManyTrainFileGetManyRouteHandler(req, res) as PartialTrainFile[];
    }

    @Get('/:id/files/download', [ForceLoggedInMiddleware])
    async download(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<Buffer> {
        return await streamTrainFileRouteHandler(req, res) as Buffer;
    }

    @Get('/:id/files/:fileId', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Params('fileId') fileId: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainFile | undefined> {
        return await getOneTrainFileRouteHandler(req, res) as PartialTrainFile | undefined;
    }

    @Delete('/:id/files/:fileId', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Params('fileId') fileId: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainFile | undefined> {
        return await deleteTrainFileRouteHandler(req, res) as PartialTrainFile | undefined;
    }

    @Post('/:id/files', [ForceLoggedInMiddleware])
    async add(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainFile | undefined> {
        return await uploadTrainFilesRouteHandler(req, res) as PartialTrainFile | undefined;
    }
}
