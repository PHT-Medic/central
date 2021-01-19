import {Oauth2AuthorizeProvider} from "../../../modules/auth/providers";
import {AuthenticatorScheme, Provider} from "../../../domains/provider";
import {getRepository} from "typeorm";
import {createToken} from "../../../modules/auth/utils/token";
import TokenResponseSchema from "../../../domains/token/TokenResponseSchema";
import env from "../../../env";
import {Realm} from "../../../domains/realm";
import {check, matchedData, validationResult} from "express-validator";

export async function getProvidersRoute(req: any, res: any) {
    const repository = getRepository(Provider);

    let result = await repository.find({relations: ['realm']});

    result = result.map((provider: Provider) => {
        if(!req.user || !req.ability.can('edit','realm')) {
            delete provider.client_secret;
        }

        return provider;
    });

    return res._respond({
        data: result
    })
}

//---------------------------------------------------------------------------------

export async function getProviderRoute(req: any, res: any) {
    const { id } = req.params;

    const repository = getRepository(Provider);

    let result = await repository.findOne(id, {relations: ['realm']});

    return res._respond({
        data: result
    })
}

//---------------------------------------------------------------------------------

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

//---------------------------------------------------------------------------------

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

    let provider = providerRepository.create(data);

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

//---------------------------------------------------------------------------------

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

//---------------------------------------------------------------------------------

export async function dropProviderRoute(req: any, res: any) {
    let {id} = req.params;

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

//---------------------------------------------------------------------------------

export async function authorizeUrlRoute(req: any, res: any) {
    let { id } = req.params;

    const repository = getRepository(Provider);
    let provider = await repository.createQueryBuilder('provider')
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
    let { id } = req.params;
    let { code, state } = req.query;

    const repository = getRepository(Provider);
    let provider = await repository.createQueryBuilder('provider')
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
        } = await createToken(payload);

        const cookie = {
            accessToken: token,
            meta: {
                expireDate: new Date(Date.now() + 1000 * expiresIn).toString(),
                expiresIn: expiresIn
            }
        };

        res.cookie('auth_token', JSON.stringify(cookie), {
            maxAge: Date.now() + 1000 * expiresIn
        });

        res.cookie('auth_provider','local',{
            maxAge: Date.now() + 1000 * expiresIn
        });

        let ob = {
            token,
            expires_in: expiresIn
        };

        let tokenResponseSchema = new TokenResponseSchema();
        ob = tokenResponseSchema.applySchemaOnEntity(ob);

        return res.redirect(env.webAppUrl);
    } catch (e) {
        console.log(e);
        return res._failValidationError({message: 'Die Zugangsdaten sind nicht gültig oder der lokale Authenticator ist nicht erreichbar.'});
    }
}
