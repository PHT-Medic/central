/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { Oauth2ProviderRole, PermissionID } from '@personalhealthtrain/ui-common';
import { applyFilters, applyPagination } from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { check, matchedData, validationResult } from 'express-validator';
import { SwaggerTags } from '@trapi/swagger';
import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { ExpressValidationError } from '../../../config/http/error/validation';
import { ExpressRequest, ExpressResponse } from '../../../config/http/type';
import { ForceLoggedInMiddleware } from '../../../config/http/middleware/auth';

export async function getManyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { page, filter } = req.query;

    const repository = getRepository(Oauth2ProviderRole);

    const query = repository.createQueryBuilder('providerRole');

    applyFilters(query, filter, {
        defaultAlias: 'providerRole',
        allowed: ['role_id', 'provider_id'],
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

// ---------------------------------------------------------------------------------

export async function getRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const repository = getRepository(Oauth2ProviderRole);

    const query = repository.createQueryBuilder('providerRole')
        .where('providerRole.id = :id', { id });

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
    if (operation === 'create') {
        await check('provider_id')
            .exists()
            .isString()
            .run(req);

        await check('role_id')
            .exists()
            .isInt()
            .run(req);
    }

    const externalPromise = await check('external_id')
        .exists()
        .isLength({ min: 3, max: 36 });
    if (operation === 'update') externalPromise.optional();

    await externalPromise.run(req);
}

// ---------------------------------------------------------------------------------

export async function addRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.PROPOSAL_EDIT)) {
        throw new ForbiddenError();
    }

    await runValidation(req, 'create');

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data : Partial<Oauth2ProviderRole> = matchedData(req, { includeOptionals: true });
    if (!data) {
        return res.respondAccepted();
    }

    const repository = getRepository(Oauth2ProviderRole);

    const entity = repository.create(data);

    await repository.save(entity);

    return res.respond({
        data: entity,
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

    const data : Partial<Oauth2ProviderRole> = matchedData(req, { includeOptionals: true });
    if (!data) {
        return res.respondAccepted();
    }

    const repository = getRepository(Oauth2ProviderRole);

    let provider = await repository.findOne(id);
    if (typeof provider === 'undefined') {
        throw new NotFoundError();
    }

    provider = repository.merge(provider, data);

    await repository.save(provider);

    return res.respond({
        data: provider,
    });
}

// ---------------------------------------------------------------------------------

export async function dropRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.PROVIDER_EDIT)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(Oauth2ProviderRole);
    const entity = await repository.findOne(id);
    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    await repository.remove(entity);

    return res.respondDeleted();
}

// ---------------------------------------------------------------------------------

@SwaggerTags('auth')
@Controller('/provider-roles')
export class ProviderRoleController {
    @Get('', [])
    async getProviders(
        @Request() req: any,
            @Response() res: any,
    ): Promise<Oauth2ProviderRole[]> {
        return getManyRouteHandler(req, res);
    }

    @Get('/:id', [])
    async getProvider(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<Oauth2ProviderRole> {
        return getRouteHandler(req, res);
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async editProvider(
        @Params('id') id: string,
            @Body() user: NonNullable<Oauth2ProviderRole>,
            @Request() req: any,
            @Response() res: any,
    ): Promise<Oauth2ProviderRole> {
        return editRouteHandler(req, res);
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async dropProvider(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<Oauth2ProviderRole> {
        return dropRouteHandler(req, res);
    }

    @Post('', [ForceLoggedInMiddleware])
    async addProvider(
        @Body() user: NonNullable<Oauth2ProviderRole>,
            @Request() req: any,
            @Response() res: any,
    ): Promise<Oauth2ProviderRole> {
        return addRouteHandler(req, res);
    }
}
