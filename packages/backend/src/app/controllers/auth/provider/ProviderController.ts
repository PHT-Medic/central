import {Oauth2AuthorizeProvider} from "../../../../modules/auth/providers";
import {AuthenticatorScheme, Provider} from "../../../../domains/provider";
import {getRepository} from "typeorm";
import {createToken} from "../../../../modules/auth/utils/token";
import env from "../../../../env";
import {Realm} from "../../../../domains/realm";
import {check, matchedData, validationResult} from "express-validator";
import {applyRequestPagination} from "../../../../db/utils/pagination";
import {applyRequestFilterOnQuery} from "../../../../db/utils/filter";
import {Controller, Get, Post, Delete, Params, Request, Response, Body} from "@decorators/express";
import {ForceLoggedInMiddleware} from "../../../../modules/http/request/middleware/auth";
import {SwaggerHidden, SwaggerTags} from "typescript-swagger";
import {applyRequestFields} from "../../../../db/utils/select";

@SwaggerTags('auth')
@Controller("/providers")
export class ProviderController {
    @Get("", [])
    async getProviders(
        @Request() req: any,
        @Response() res: any
    ): Promise<Provider[]> {
        return await getProvidersRoute(req, res);
    }

    @Get("/:id", [])
    async getProvider(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<Provider> {
        return await getProviderRoute(req, res);
    }

    @Post("/:id", [ForceLoggedInMiddleware])
    async editProvider(
        @Params('id') id: string,
        @Body() user: NonNullable<Provider>,
        @Request() req: any,
        @Response() res: any
    ) : Promise<Provider> {
        // todo: implement edit
        return await editProviderRoute(req, res);
    }

    @Delete("/:id", [ForceLoggedInMiddleware])
    async dropProvider(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ) : Promise<Provider> {
        return await dropProviderRoute(req, res);
    }

    @Post("", [ForceLoggedInMiddleware])
    async addProvider(
        @Body() user: NonNullable<Provider>,
        @Request() req: any,
        @Response() res: any
    ) : Promise<Provider> {
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

    const repository = getRepository(Provider);

    const query = repository.createQueryBuilder('provider').
    leftJoinAndSelect('provider.realm', 'realm');

    applyRequestFilterOnQuery(query, filter, {
        realmId: 'provider.realm_id'
    });

    applyRequestFields(query, 'provider', fields, [
        'client_secret'
    ]);

    const pagination = applyRequestPagination(query, page, 50);

    // tslint:disable-next-line:prefer-const
    let [entities, total] = await query.getManyAndCount();

    entities = entities.map((provider: Provider) => {
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

    const repository = getRepository(Provider);

    const query = repository.createQueryBuilder('provider')
        .leftJoinAndSelect('provider.realm', 'realm')
        .where("provider.id = :id", {id});

    applyRequestFields(query, 'provider', fields, [
        'client_secret'
    ]);

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
    await check('scheme').exists().notEmpty().isIn([AuthenticatorScheme.OAUTH2, AuthenticatorScheme.OPENID]).run(req);
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

    const providerRepository = getRepository(Provider);

    const provider = providerRepository.create(data);

    try {
        await providerRepository.save(provider);

        provider.realm = await getRepository(Realm).findOne(provider.realm_id);

        return res._respond({
            data: provider
        })
    } catch (e) {
        return res._failValidationError({message: 'Der Provider konnte nicht erstellt werden.'});
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

    const providerRepository = getRepository(Provider);

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
        return res._failValidationError({message: 'Der Provider konnte nicht editiert werden.'});
    }
}

// ---------------------------------------------------------------------------------

export async function dropProviderRoute(req: any, res: any) {
    const {id} = req.params;

    if (!req.ability.can('drop', 'provider')) {
        return res._failForbidden();
    }

    try {
        const userRepository = getRepository(Provider);
        await userRepository.delete(id);

        return res._respondDeleted();
    } catch(e) {
        return res._failValidationError();
    }
}

// ---------------------------------------------------------------------------------

export async function authorizeUrlRoute(req: any, res: any) {
    const { id } = req.params;

    const repository = getRepository(Provider);
    const provider = await repository.createQueryBuilder('provider')
        .addSelect('provider.client_secret')
        .leftJoinAndSelect('provider.realm', 'realm')
        .where('provider.id = :id', {id})
        .orWhere('provider.name Like :name', {name: id})
        .getOne();

    if(typeof provider === 'undefined') {
        return res._failNotFound();
    }

    const oauth2AuthorizeProvider = new Oauth2AuthorizeProvider(provider);

    return res.redirect(oauth2AuthorizeProvider.authorizeUrl());
}

export async function authorizeCallbackRoute(req: any, res: any) {
    const { id } = req.params;
    const { code, state } = req.query;

    const repository = getRepository(Provider);
    const provider = await repository.createQueryBuilder('provider')
        .addSelect('provider.client_secret')
        .leftJoinAndSelect('provider.realm', 'realm')
        .where('provider.id = :id', {id})
        .orWhere('provider.name Like :name', {name: id})
        .getOne();

    if(typeof provider === 'undefined') {
        return res._failNotFound();
    }

    const oauth2AuthorizeProvider = new Oauth2AuthorizeProvider(provider);

    try {

        const loginToken = await oauth2AuthorizeProvider.getToken({
            code,
            state
        });

        const userAccount = await oauth2AuthorizeProvider.loginWithToken(loginToken);

        const payload = {
            id: userAccount.user_id
        }

        const {
            token,
            expiresIn
        } = await createToken(payload, env.jwtMaxAge);

        const cookie = {
            accessToken: token,
            meta: {
                expireDate: new Date(Date.now() + 1000 * expiresIn).toString(),
                expiresIn
            }
        };

        res.cookie('auth_token', JSON.stringify(cookie), {
            maxAge: Date.now() + 1000 * expiresIn
        });

        res.cookie('auth_provider','local',{
            maxAge: Date.now() + 1000 * expiresIn
        });

        return res.redirect(env.webAppUrl);
    } catch (e) {
        console.log(e);
        return res._failValidationError({message: 'Die Zugangsdaten sind nicht gültig oder der lokale Authenticator ist nicht erreichbar.'});
    }
}
