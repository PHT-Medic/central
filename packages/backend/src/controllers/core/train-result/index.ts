/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { applyFilters, applyPagination } from 'typeorm-extension';
import {
    PermissionID, TrainResult,
} from '@personalhealthtrain/ui-common';

import {
    Controller, Delete, Get, Params, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { onlyRealmPermittedQueryResources } from '@typescript-auth/server';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { ForceLoggedInMiddleware } from '../../../config/http/middleware/auth';
import { ExpressRequest, ExpressResponse } from '../../../config/http/type';
import { TrainResultEntity } from '../../../domains/core/train-result/entity';

export async function getManyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page } = req.query;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_RESULT_READ)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainResultEntity);
    const query = await repository.createQueryBuilder('trainResult')
        .leftJoinAndSelect('trainResult.train', 'train');

    onlyRealmPermittedQueryResources(query, req.realmId, ['train.realm_id']);

    applyFilters(query, filter, {
        defaultAlias: 'trainResult',
        allowed: ['train_id', 'user_id'],
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

export async function getOneRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_RESULT_READ)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainResultEntity);
    const entity = await repository.findOne(id, { relations: ['train'] });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(req.realmId, entity.train.realm_id)
    ) {
        throw new ForbiddenError();
    }

    return res.respond({ data: entity });
}

export async function dropRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (
        !req.ability.hasPermission(PermissionID.TRAIN_RESULT_READ) &&
        !req.ability.hasPermission(PermissionID.TRAIN_EDIT)
    ) {
        throw new ForbiddenError();
    }

    const repository = getRepository(TrainResultEntity);

    const entity : TrainResult | undefined = await repository.findOne(id, { relations: ['train'] });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(req.realmId, entity.train.realm_id)
    ) {
        throw new ForbiddenError();
    }

    await repository.delete(entity.id);

    return res.respondDeleted({ data: entity });
}

type PartialTrainResult = Partial<TrainResult>;

@SwaggerTags('pht')
@Controller('/train-results')
export class TrainResultController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainResult[]> {
        return await getManyRouteHandler(req, res) as PartialTrainResult[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainResult | undefined> {
        return await getOneRouteHandler(req, res) as PartialTrainResult | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialTrainResult | undefined> {
        return await dropRouteHandler(req, res) as PartialTrainResult | undefined;
    }
}
