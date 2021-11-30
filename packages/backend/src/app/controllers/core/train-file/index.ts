/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { applyFilters } from 'typeorm-extension';
import {
    PermissionID,
    Train, TrainFile, isPermittedForResourceRealm, onlyRealmPermittedQueryResources,
} from '@personalhealthtrain/ui-common';
import fs from 'fs';
import {
    Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { ResponseExample, SwaggerTags } from 'typescript-swagger';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getTrainFileFilePath } from '../../../../config/pht/train-file/path';

import { getTrainFileStreamRouteHandler } from './stream';
import { uploadTrainFilesRouteHandler } from './upload';
import { ForceLoggedInMiddleware } from '../../../../config/http/middleware/auth';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';

type PartialTrainFile = Partial<TrainFile>;
const simpleExample : PartialTrainFile = {
    name: 'model.py',
    directory: '/',
    train_id: 'xxx',
};

@SwaggerTags('pht')
@Controller('/trains')
export class TrainFileController {
    @Get('/:id/files', [ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainFile[]>([simpleExample])
    async getMany(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainFile[]> {
        return await getTrainFilesRouteHandler(req, res) as PartialTrainFile[];
    }

    @Get('/:id/files/download', [ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainFile>(simpleExample)
    async download(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<Buffer> {
        return await getTrainFileStreamRouteHandler(req, res) as Buffer;
    }

    @Get('/:id/files/:fileId', [ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainFile>(simpleExample)
    async getOne(
        @Params('id') id: string,
            @Params('fileId') fileId: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainFile | undefined> {
        return await getTrainFileRouteHandler(req, res) as PartialTrainFile | undefined;
    }

    @Delete('/:id/files/:fileId', [ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainFile>(simpleExample)
    async drop(
        @Params('id') id: string,
            @Params('fileId') fileId: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainFile | undefined> {
        return await dropTrainFileRouteHandler(req, res) as PartialTrainFile | undefined;
    }

    @Post('/:id/files', [ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainFile[]>([
        simpleExample,
    ])
    async add(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainFile | undefined> {
        return await uploadTrainFilesRouteHandler(req, res) as PartialTrainFile | undefined;
    }
}

export async function getTrainFileRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (
        !req.ability.hasPermission(PermissionID.TRAIN_ADD)
        && !req.ability.hasPermission(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const { fileId } = req.params;

    const repository = getRepository(TrainFile);

    const entity = await repository.findOne({
        id: fileId,
    });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    return res.respond({ data: entity });
}

export async function getTrainFilesRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { filter } = req.query;

    const repository = getRepository(TrainFile);
    const query = repository.createQueryBuilder('trainFile')
        .where('trainFile.train_id = :trainId', { trainId: id });

    onlyRealmPermittedQueryResources(query, req.realmId);

    applyFilters(query, filter, {
        defaultAlias: 'trainFile',
        allowed: ['id', 'name', 'realm_id'],
    });

    const entity = await query.getMany();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function dropTrainFileRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { fileId } = req.params;

    if (typeof fileId !== 'string' || !fileId.length) {
        throw new BadRequestError();
    }

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_ADD)
        && !req.ability.hasPermission(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainFile);

    const entity = await repository.findOne(fileId);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    fs.unlinkSync(getTrainFileFilePath(entity));

    const trainRepository = getRepository(Train);
    await trainRepository.update({ id: entity.train_id }, {
        configuration_status: null,
        hash: null,
        hash_signed: null,
    });

    await repository.delete(entity.id);

    return res.respondDeleted({ data: entity });
}
