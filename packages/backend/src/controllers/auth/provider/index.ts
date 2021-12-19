/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { applyFields, applyFilters, applyPagination } from 'typeorm-extension';
import { check, matchedData, validationResult } from 'express-validator';
import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerHidden, SwaggerTags } from '@trapi/swagger';
import { OAuth2Provider, PermissionID, Realm } from '@personalhealthtrain/ui-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { ForceLoggedInMiddleware } from '../../../config/http/middleware/auth';
import { authorizeCallbackRoute, authorizeUrlRoute } from './authorize';
import { ExpressRequest, ExpressResponse } from '../../../config/http/type';
import { ExpressValidationError } from '../../../config/http/error/validation';

export async function getProvidersRoute(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { page, filter, fields } = req.query;

    const repository = getRepository(OAuth2Provider);

    const query = repository.createQueryBuilder('provider')
        .leftJoinAndSelect('provider.realm', 'realm');

    applyFilters(query, filter, {
        defaultAlias: 'provider',
        allowed: ['realm_id'],
    });

    // todo: allow realm owner view of client_secret
    if (!req.user || !req.ability.can('edit', 'realm')) {
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

export async function getProviderRoute(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { fields } = req.query;
    const { id } = req.params;

    const repository = getRepository(OAuth2Provider);

    const query = repository.createQueryBuilder('provider')
        .leftJoinAndSelect('provider.realm', 'realm')
        .where('provider.id = :id', { id });

    // todo: allow realm owner view of client_secret
    if (!req.user || !req.ability.hasPermission(PermissionID.REALM_EDIT)) {
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

async function runValidation(req: ExpressRequest) {
    await check('name').exists().notEmpty().isString()
        .isLength({ min: 5, max: 30 })
        .run(req);
    await check('open_id').exists().notEmpty().isBoolean()
        .run(req);
    await check('token_host').exists().notEmpty().isString()
        .isLength({ min: 5, max: 512 })
        .run(req);
    await check('token_path').exists().notEmpty().isString()
        .isLength({ min: 5, max: 256 })
        .optional({ nullable: true })
        .run(req);
    await check('token_revoke_path').exists().notEmpty().isString()
        .isLength({ min: 5, max: 256 })
        .optional({ nullable: true })
        .run(req);
    await check('authorize_host').exists().notEmpty().isString()
        .isLength({ min: 5, max: 512 })
        .optional({ nullable: true })
        .run(req);
    await check('authorize_path').exists().notEmpty().isString()
        .isLength({ min: 5, max: 256 })
        .optional({ nullable: true })
        .run(req);
    await check('scope').exists().notEmpty().isString()
        .isLength({ min: 3, max: 512 })
        .optional({ nullable: true })
        .run(req);
    await check('client_id').exists().notEmpty().isString()
        .isLength({ min: 3, max: 128 })
        .run(req);
    await check('client_secret').exists().notEmpty().isString()
        .isLength({ min: 3, max: 128 })
        .optional({ nullable: true })
        .run(req);
    await check('realm_id').exists().notEmpty().custom((value: any) => getRepository(Realm).findOne(value).then((realm: Realm | undefined) => {
        if (typeof realm === 'undefined') {
            throw new Error('Der Realm wurde nicht gefunden.');
        }
    }))
        .run(req);
}

// ---------------------------------------------------------------------------------

export async function addProviderRoute(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.PROVIDER_ADD)) {
        throw new ForbiddenError();
    }

    await runValidation(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: true });
    if (!data) {
        return res.respondAccepted();
    }

    const providerRepository = getRepository(OAuth2Provider);

    const provider = providerRepository.create(data);

    await providerRepository.save(provider);

    provider.realm = await getRepository(Realm).findOne(provider.realm_id);

    return res.respond({
        data: provider,
    });
}

// ---------------------------------------------------------------------------------

export async function editProviderRoute(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.PROPOSAL_EDIT)) {
        throw new ForbiddenError();
    }

    await runValidation(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: true });
    if (!data) {
        return res.respondAccepted();
    }

    const providerRepository = getRepository(OAuth2Provider);

    let provider = await providerRepository.findOne(id);
    if (typeof provider === 'undefined') {
        throw new NotFoundError();
    }

    provider = providerRepository.merge(provider, data);

    await providerRepository.save(provider);

    provider.realm = await getRepository(Realm).findOne(provider.realm_id);

    return res.respond({
        data: provider,
    });
}

// ---------------------------------------------------------------------------------

export async function dropProviderRoute(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.PROVIDER_DROP)) {
        throw new ForbiddenError();
    }

    const userRepository = getRepository(OAuth2Provider);
    await userRepository.delete(id);

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
        return getProvidersRoute(req, res);
    }

    @Get('/:id', [])
    async getProvider(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<OAuth2Provider> {
        return getProviderRoute(req, res);
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async editProvider(
        @Params('id') id: string,
            @Body() user: NonNullable<OAuth2Provider>,
            @Request() req: any,
            @Response() res: any,
    ) : Promise<OAuth2Provider> {
        return editProviderRoute(req, res);
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async dropProvider(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ) : Promise<OAuth2Provider> {
        return dropProviderRoute(req, res);
    }

    @Post('', [ForceLoggedInMiddleware])
    async addProvider(
        @Body() user: NonNullable<OAuth2Provider>,
            @Request() req: any,
            @Response() res: any,
    ) : Promise<OAuth2Provider> {
        return addProviderRoute(req, res);
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
