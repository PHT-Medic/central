/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { applyFilters, applyPagination } from 'typeorm-extension';
import { MasterImageGroup, PermissionID } from '@personalhealthtrain/ui-common';

import {
    Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { ForceLoggedInMiddleware } from '../../../config/http/middleware/auth';
import { ExpressRequest, ExpressResponse } from '../../../config/http/type';
import { MasterImageGroupEntity } from '../../../domains/core/master-image-group/entity';

type PartialMasterImageGroup = Partial<MasterImageGroup>;

@SwaggerTags('pht')
@Controller('/master-image-groups')
export class MasterImageGroupController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialMasterImageGroup[]> {
        return await getManyRouteHandler(req, res) as PartialMasterImageGroup[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialMasterImageGroup | undefined> {
        return await getRouteHandler(req, res) as PartialMasterImageGroup | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialMasterImageGroup | undefined> {
        return await dropRouteHandler(req, res) as PartialMasterImageGroup | undefined;
    }
}

export async function getRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const repository = getRepository(MasterImageGroupEntity);

    const entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function getManyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { page, filter } = req.query;

    const repository = getRepository(MasterImageGroupEntity);
    const query = repository.createQueryBuilder('imageGroup');

    applyFilters(query, filter, {
        allowed: ['id', 'name', 'path', 'virtual_path'],
        defaultAlias: 'imageGroup',
    });

    const pagination = applyPagination(query, page, { maxLimit: 50 });

    const [entities, total] = await query.getManyAndCount();

    return res.respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination,
            },
        },
    });
}

export async function dropRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.MASTER_IMAGE_GROUP_MANAGE)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(MasterImageGroupEntity);

    const entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    await repository.delete(entity.id);

    return res.respondDeleted({ data: entity });
}
