/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {getRepository} from "typeorm";
import {applyFields, applyFilters, applyPagination} from "typeorm-extension";
import {check, matchedData, validationResult} from "express-validator";
import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {SwaggerHidden, SwaggerTags} from "typescript-swagger";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";
import {OAuth2Provider, Realm} from "@personalhealthtrain/ui-common";
import {authorizeCallbackRoute, authorizeUrlRoute} from "./authorize";

@SwaggerTags('auth')
@Controller("/providers")
export class ProviderController {
    @Get("", [])
    async getProviders(
        @Request() req: any,
        @Response() res: any
    ): Promise<OAuth2Provider[]> {
        return await getProvidersRoute(req, res);
    }

    @Get("/:id", [])
    async getProvider(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<OAuth2Provider> {
        return await getProviderRoute(req, res);
    }

    @Post("/:id", [ForceLoggedInMiddleware])
    async editProvider(
        @Params('id') id: string,
        @Body() user: NonNullable<OAuth2Provider>,
        @Request() req: any,
        @Response() res: any
    ) : Promise<OAuth2Provider> {
        return await editProviderRoute(req, res);
    }

    @Delete("/:id", [ForceLoggedInMiddleware])
    async dropProvider(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ) : Promise<OAuth2Provider> {
        return await dropProviderRoute(req, res);
    }

    @Post("", [ForceLoggedInMiddleware])
    async addProvider(
        @Body() user: NonNullable<OAuth2Provider>,
        @Request() req: any,
        @Response() res: any
    ) : Promise<OAuth2Provider> {
        return await addProviderRoute(req, res);
    }

    // ------------------------------------------------------------

    @Get('/:id/authorize-url')
    @SwaggerHidden()
    async getAuthorizeUrl(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ) {
        return await authorizeUrlRoute(req, res);
    }

    @Get('/:id/authorize-callback')
    @SwaggerHidden()
    async getAuthorizeCallback(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ) {
        return await authorizeCallbackRoute(req, res);
    }
}

export async function getProvidersRoute(req: any, res: any) {
    const { page, filter, fields } = req.query;

    const repository = getRepository(OAuth2Provider);

    const query = repository.createQueryBuilder('provider').
    leftJoinAndSelect('provider.realm', 'realm');

    applyFilters(query, filter, {
        queryAlias: 'provider',
        allowed: ['realm_id']
    });

    // todo: allow realm owner view of client_secret
    if(!req.user || !req.ability.can('edit','realm')) {
        applyFields(
            query,
            fields,
            {
                queryAlias: 'provider',
                allowed: ['client_secret']
            }
        );
    }

    const pagination = applyPagination(query, page, {maxLimit: 50});

    // tslint:disable-next-line:prefer-const
    let [entities, total] = await query.getManyAndCount();

    // todo: allow realm owner view of client_secret
    entities = entities.map((provider: OAuth2Provider) => {
        if(!req.user || !req.ability.can('edit','realm')) {
            delete provider.client_secret;
        }

        return provider;
    });

    return res._respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination
            }
        }
    });
}

// ---------------------------------------------------------------------------------

export async function getProviderRoute(req: any, res: any) {
    const { fields } = req.query;
    const { id } = req.params;

    const repository = getRepository(OAuth2Provider);

    const query = repository.createQueryBuilder('provider')
        .leftJoinAndSelect('provider.realm', 'realm')
        .where("provider.id = :id", {id});

    // todo: allow realm owner view of client_secret
    if(!req.user || !req.ability.can('edit','realm')) {
        applyFields(
            query,
            fields,
            {
                queryAlias: 'provider',
                allowed: ['client_secret']
            }
        );
    }

    const result = await query.getOne();

    if(typeof result === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({
        data: result
    })
}

// ---------------------------------------------------------------------------------

async function runValidation(req: any) {
    await check('name').exists().notEmpty().isString().isLength({min: 5, max: 30}).run(req);
    await check('open_id').exists().notEmpty().isBoolean().run(req);
    await check('token_host').exists().notEmpty().isString().isLength({min: 5, max: 512}).run(req);
    await check('token_path').exists().notEmpty().isString().isLength({min: 5, max: 256}).optional({nullable: true}).run(req);
    await check('token_revoke_path').exists().notEmpty().isString().isLength({min: 5, max: 256}).optional({nullable: true}).run(req);
    await check('authorize_host').exists().notEmpty().isString().isLength({min: 5, max: 512}).optional({nullable: true}).run(req);
    await check('authorize_path').exists().notEmpty().isString().isLength({min: 5, max: 256}).optional({nullable: true}).run(req);
    await check('scope').exists().notEmpty().isString().isLength({min: 3, max: 512}).optional({nullable: true}).run(req);
    await check('client_id').exists().notEmpty().isString().isLength({min: 3, max: 128}).run(req);
    await check('client_secret').exists().notEmpty().isString().isLength({min: 3, max: 128}).optional({nullable: true}).run(req);
    await check('realm_id').exists().notEmpty().custom((value: any) => {
        return getRepository(Realm).findOne(value).then((realm: Realm | undefined) => {
            if(typeof realm === 'undefined') {
                throw new Error('Der Realm wurde nicht gefunden.')
            }
        })
    }).run(req);
}

// ---------------------------------------------------------------------------------

export async function addProviderRoute(req: any, res: any) {
    if(!req.ability.can('add','provider')) {
        return res._failForbidden();
    }

    await runValidation(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: true});
    if(!data) {
        return res._respondAccepted();
    }

    const providerRepository = getRepository(OAuth2Provider);

    const provider = providerRepository.create(data);

    try {
        await providerRepository.save(provider);

        provider.realm = await getRepository(Realm).findOne(provider.realm_id);

        return res._respond({
            data: provider
        })
    } catch (e) {
        return res._failValidationError({message: 'Der OAuth2Provider konnte nicht erstellt werden.'});
    }
}

// ---------------------------------------------------------------------------------

export async function editProviderRoute(req: any, res: any) {
    const { id } = req.params;

    if(!req.ability.can('edit','provider')) {
        return res._failForbidden();
    }

    await runValidation(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: true});
    if(!data) {
        return res._respondAccepted();
    }

    const providerRepository = getRepository(OAuth2Provider);

    let provider = await providerRepository.findOne(id);
    if(typeof provider === 'undefined') {
        return res._failNotFound();
    }

    provider = providerRepository.merge(provider, data);

    try {
        await providerRepository.save(provider);

        provider.realm = await getRepository(Realm).findOne(provider.realm_id);

        return res._respond({
            data: provider
        })
    } catch (e) {
        return res._failValidationError({message: 'Der OAuth2Provider konnte nicht editiert werden.'});
    }
}

// ---------------------------------------------------------------------------------

export async function dropProviderRoute(req: any, res: any) {
    const {id} = req.params;

    if (!req.ability.can('drop', 'provider')) {
        return res._failForbidden();
    }

    try {
        const userRepository = getRepository(OAuth2Provider);
        await userRepository.delete(id);

        return res._respondDeleted();
    } catch(e) {
        return res._failValidationError();
    }
}
