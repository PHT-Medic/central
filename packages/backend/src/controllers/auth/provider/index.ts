/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import {
    applyFields, applyFilters, applyPagination, applyRelations,
} from 'typeorm-extension';
import { check, validationResult } from 'express-validator';
import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerHidden, SwaggerTags } from '@trapi/swagger';
import {
    MASTER_REALM_ID, OAuth2Provider, PermissionID, Realm,
} from '@personalhealthtrain/ui-common';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { ForceLoggedInMiddleware } from '../../../config/http/middleware/auth';
import { authorizeCallbackRoute, authorizeUrlRoute } from './authorize';
import { ExpressRequest, ExpressResponse } from '../../../config/http/type';
import { ExpressValidationError } from '../../../config/http/error/validation';
import { matchedValidationData } from '../../../modules/express-validator';

export async function getManyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        page, filter, fields, include,
    } = req.query;

    const repository = getRepository(OAuth2Provider);

    const query = repository.createQueryBuilder('provider');

    const relations = applyRelations(query, include, {
        defaultAlias: 'provider',
        allowed: ['realm'],
    });

    applyFilters(query, filter, {
        relations,
        defaultAlias: 'provider',
        allowed: ['realm_id', 'realm.name'],
    });

    if (
        req.ability &&
        req.ability.hasPermission(PermissionID.REALM_EDIT)
    ) {
        applyFields(
            query,
            fields,
            {
                defaultAlias: 'provider',
                allowed: ['client_secret'],
            },
        );
    }

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

// ---------------------------------------------------------------------------------

export async function getRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { fields, include } = req.query;
    const { id } = req.params;

    const repository = getRepository(OAuth2Provider);

    const query = repository.createQueryBuilder('provider')
        .where('provider.id = :id', { id });

    applyRelations(query, include, {
        defaultAlias: 'provider',
        allowed: ['realm'],
    });

    if (
        req.ability &&
        req.ability.hasPermission(PermissionID.REALM_EDIT)
    ) {
        applyFields(
            query,
            fields,
            {
                defaultAlias: 'provider',
                allowed: ['client_secret'],
            },
        );
    }

    const result = await query.getOne();

    if (typeof result === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({
        data: result,
    });
}

// ---------------------------------------------------------------------------------

async function runValidation(req: ExpressRequest, operation: 'create' | 'update') {
    await check('name')
        .exists()
        .notEmpty()
        .isString()
        .isLength({ min: 5, max: 30 })
        .run(req);

    await check('open_id')
        .exists()
        .notEmpty()
        .isBoolean()
        .run(req);

    await check('token_host')
        .exists()
        .notEmpty()
        .isString()
        .isLength({ min: 5, max: 512 })
        .run(req);

    await check('token_path')
        .exists()
        .notEmpty()
        .isString()
        .isLength({ min: 5, max: 256 })
        .optional({ nullable: true })
        .run(req);
    await check('token_revoke_path')
        .exists()
        .notEmpty()
        .isString()
        .isLength({ min: 5, max: 256 })
        .optional({ nullable: true })
        .run(req);

    await check('authorize_host')
        .exists()
        .notEmpty()
        .isString()
        .isLength({ min: 5, max: 512 })
        .optional({ nullable: true })
        .run(req);

    await check('authorize_path')
        .exists()
        .notEmpty()
        .isString()
        .isLength({ min: 5, max: 256 })
        .optional({ nullable: true })
        .run(req);

    await check('scope')
        .exists()
        .notEmpty()
        .isString()
        .isLength({ min: 3, max: 512 })
        .optional({ nullable: true })
        .run(req);

    await check('client_id')
        .exists()
        .notEmpty()
        .isString()
        .isLength({ min: 3, max: 128 })
        .run(req);

    await check('client_secret')
        .exists()
        .notEmpty()
        .isString()
        .isLength({ min: 3, max: 128 })
        .optional({ nullable: true })
        .run(req);

    if (operation === 'create') {
        await check('realm_id')
            .exists()
            .notEmpty()
            .isString()
            .run(req);
    }
}

// ---------------------------------------------------------------------------------

export async function addRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.PROVIDER_ADD)) {
        throw new ForbiddenError();
    }

    await runValidation(req, 'create');

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data : Partial<OAuth2Provider> = matchedValidationData(req, { includeOptionals: true });
    if (!data) {
        return res.respondAccepted();
    }

    if (data.realm_id) {
        const realmRepository = getRepository(Realm);
        const realm = await realmRepository.findOne(data.realm_id);

        if (typeof realm === 'undefined') {
            throw new BadRequestError('The referenced realm does not exist');
        }

        if (
            req.realmId !== data.realm_id &&
            req.realmId !== MASTER_REALM_ID
        ) {
            throw new ForbiddenError('You are not permitted to the create an authentication provider for that realm.');
        }
    }

    const repository = getRepository(OAuth2Provider);

    const provider = repository.create(data);

    await repository.save(provider);

    return res.respond({
        data: provider,
    });
}

// ---------------------------------------------------------------------------------

export async function editRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.PROVIDER_EDIT)) {
        throw new ForbiddenError();
    }

    await runValidation(req, 'update');

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data : Partial<OAuth2Provider> = matchedValidationData(req, { includeOptionals: true });
    if (!data) {
        return res.respondAccepted();
    }

    const repository = getRepository(OAuth2Provider);

    let entity = await repository.findOne(id);
    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    entity = repository.merge(entity, data);

    await repository.save(entity);

    return res.respond({
        data: entity,
    });
}

// ---------------------------------------------------------------------------------

export async function dropRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.PROVIDER_DROP)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(OAuth2Provider);
    const entity = await repository.findOne(id);
    await repository.remove(entity);

    return res.respondDeleted();
}

// ---------------------------------------------------------------------------------

@SwaggerTags('auth')
@Controller('/providers')
export class ProviderController {
    @Get('', [])
    async getProviders(
        @Request() req: any,
            @Response() res: any,
    ): Promise<OAuth2Provider[]> {
        return getManyRouteHandler(req, res);
    }

    @Get('/:id', [])
    async getProvider(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<OAuth2Provider> {
        return getRouteHandler(req, res);
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async editProvider(
        @Params('id') id: string,
            @Body() user: NonNullable<OAuth2Provider>,
            @Request() req: any,
            @Response() res: any,
    ) : Promise<OAuth2Provider> {
        return editRouteHandler(req, res);
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async dropProvider(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ) : Promise<OAuth2Provider> {
        return dropRouteHandler(req, res);
    }

    @Post('', [ForceLoggedInMiddleware])
    async addProvider(
        @Body() user: NonNullable<OAuth2Provider>,
            @Request() req: any,
            @Response() res: any,
    ) : Promise<OAuth2Provider> {
        return addRouteHandler(req, res);
    }

    // ------------------------------------------------------------

    @Get('/:id/authorize-url')
    @SwaggerHidden()
    async getAuthorizeUrl(
    @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
    ) {
        return authorizeUrlRoute(req, res);
    }

    @Get('/:id/authorize-callback')
    @SwaggerHidden()
    async getAuthorizeCallback(
    @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
    ) {
        return authorizeCallbackRoute(req, res);
    }
}
