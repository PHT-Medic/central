/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { FindConditions, getRepository } from 'typeorm';
import { check, matchedData, validationResult } from 'express-validator';
import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from 'typescript-swagger';
import {
    APIType,
    PermissionID,
    SecretType,
    USER_SECRET_ENGINE_KEY,
    User,
    UserSecret,
    UserSecretEngineSecretPayload,
    buildSecretStorageUserKey,
    onlyRealmPermittedQueryResources,
    saveToSecretEngine,
    useAPI,
} from '@personalhealthtrain/ui-common';
import { BadRequestError, NotFoundError } from '@typescript-error/http';
import {
    applyFields, applyFilters, applyPagination, applyRelations, applySort,
} from 'typeorm-extension';
import { ForceLoggedInMiddleware } from '../../../../config/http/middleware/auth';
import env from '../../../../env';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { ExpressValidationError } from '../../../../config/http/error/validation';

export async function getManyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        include, fields, filter, page, sort,
    } = req.query;

    const repository = getRepository(UserSecret);
    const query = await repository.createQueryBuilder('entity');

    onlyRealmPermittedQueryResources(query, req.realmId);

    if (!req.ability.hasPermission(PermissionID.USER_EDIT)) {
        query.where('entity.user_id = :userId', { userId: req.userId });
    }

    applyFields(query, fields, {
        defaultAlias: 'entity',
        allowed: ['id', 'type', 'content', 'user_id', 'created_at', 'updated_at'],
    });

    applyFilters(query, filter, {
        defaultAlias: 'entity',
        allowed: ['id', 'type', 'user_id'],
    });

    applyRelations(query, include, {
        defaultAlias: 'entity',
        allowed: ['user'],
    });

    applySort(query, sort, {
        defaultAlias: 'entity',
        allowed: ['id', 'created_at', 'updated_at', 'user_id'],
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

export async function getRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const repository = getRepository(UserSecret);
    const query = await repository.createQueryBuilder('entity')
        .where('entity.id = :id', { id });

    onlyRealmPermittedQueryResources(query, req.realmId);

    if (!req.ability.hasPermission(PermissionID.USER_EDIT)) {
        query.where('entity.user_id = :userId', { userId: req.userId });
    }

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

async function runValidationRules(req: ExpressRequest) {
    if (
        env.userSecretsImmutable
        && !req.ability.hasPermission(PermissionID.USER_EDIT)
    ) {
        throw new BadRequestError('User secrets are immutable and can not be changed in this environment.');
    }

    await check('content').optional({ nullable: true }).isLength({ min: 3, max: 8192 }).run(req);
    await check('type').optional({ nullable: true }).isIn(Object.values(SecretType)).run(req);
}

async function extendSecretEnginePayload(
    id: typeof User.prototype.id,
    type: SecretType,
    value: string,
) {
    const keyPath = buildSecretStorageUserKey(id);

    let payload : UserSecretEngineSecretPayload;

    try {
        const { data: responseData } = await useAPI(APIType.VAULT)
            .get(keyPath);

        payload = responseData.data.data;
    } catch (e) {
        // ...
    }

    switch (type) {
        case SecretType.PAILLIER_PUBLIC_KEY:
            payload.data.paillier_public_key = value;
            break;
        case SecretType.RSA_PUBLIC_KEY:
            payload.data.rsa_public_key = value;
            break;
    }

    await saveToSecretEngine(USER_SECRET_ENGINE_KEY, id.toString(), payload);
}

async function addRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    await runValidationRules(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: false });

    const repository = getRepository(UserSecret);

    const entity = repository.create({
        user_id: req.user.id,
        ...data,
    });

    await repository.save(entity);

    await extendSecretEnginePayload(entity.id, entity.type, entity.content);

    return res.respond({ data: entity });
}

async function editRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    await runValidationRules(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: false });

    const repository = getRepository(UserSecret);

    let entity = await repository.findOne({
        id: parseInt(id, 10),
        ...(!req.ability.hasPermission(PermissionID.USER_EDIT) ? { user_id: req.user.id } : {}),
    });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    entity = repository.merge(entity, data);

    await repository.save(entity);

    await extendSecretEnginePayload(entity.id, entity.type, entity.content);

    return res.respond({ data: entity });
}

async function dropRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const repository = getRepository(UserSecret);

    const conditions : FindConditions<UserSecret> = {
        id: parseInt(id, 10),
    };

    if (!req.ability.hasPermission(PermissionID.USER_EDIT)) {
        conditions.user_id = req.userId;
    }

    const entity = await repository.findOne(conditions);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    await repository.remove(entity);

    return res.respondDeleted({ data: entity });
}

@SwaggerTags('user', 'pht')
@Controller('/user-secrets')
export class UserKeyController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ) : Promise<UserSecret> {
        return getManyRouteHandler(req, res);
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async get(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ) : Promise<UserSecret> {
        return getRouteHandler(req, res);
    }

    @Post('', [ForceLoggedInMiddleware])
    async add(
        @Request() req: any,
            @Response() res: any,
            @Body() data: Pick<UserSecret, 'type' | 'content'>,
    ) : Promise<UserSecret> {
        return addRouteHandler(req, res);
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async edit(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
            @Body() data: Pick<UserSecret, 'type' | 'content'>,
    ) : Promise<UserSecret> {
        return editRouteHandler(req, res);
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ) : Promise<UserSecret> {
        return dropRouteHandler(req, res);
    }
}
