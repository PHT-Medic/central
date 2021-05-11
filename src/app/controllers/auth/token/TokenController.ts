import TokenResponseSchema from "../../../../domains/token/TokenResponseSchema";
import {createToken} from "../../../../modules/auth/utils/token";
import {getCustomRepository, getRepository} from "typeorm";
import {UserRepository} from "../../../../domains/user/repository";
import {Provider} from "../../../../domains/provider";
import {Oauth2PasswordProvider} from "../../../../modules/auth/providers";

import {Response, Request, Controller, Post, Body, Delete} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";


type Token = {
    /**
    @IsInt
     */
    expires_in: number,
    token: string
}

interface Anselm {
    keck: string
}

@SwaggerTags('auth')
@Controller("/auth/token")
export class TokenController {
    @Post("")
    @ResponseExample<Token>({expires_in: 3600, token: '20f81b13d51c65798f05'})
    async addToken(
        @Body() credentials: { name: string, password: string, provider?: string },
        @Request() req: any,
        @Response() res: any
    ) : Promise<Token>  {
        return (await grantToken(req,res)) as Token;
    }

    @Delete("")
    dropToken(
        @Response() res: any
    ) {
        return res.sendStatus(200).end();
    }
}

const grantToken = async (req: any, res: any) : Promise<any> => {
    const {name, password, provider} = req.body;

    let payload : {[key: string] : any};

    try {
        if(typeof provider === 'number') {
            const providerRepository = getRepository(Provider);
            const authenticator = await providerRepository.createQueryBuilder('provider')
                .leftJoinAndSelect('provider.realm', 'realm')
                .where("provider.id = :id", {id: provider})
                .andWhere("provider.realm_id = :realmId", {realmId: 'master'})
                .getOne();

            if(typeof authenticator === 'undefined') {
                return res._failValidationError({message: 'Die Konfigurationen für den alternativen lokalen Authenticator wurden nicht gefunden.'});
            }

            const oauth2Provider = new Oauth2PasswordProvider(authenticator);

            try {
                const loginToken = await oauth2Provider.getToken(name, password);
                const userAccount = await oauth2Provider.loginWithToken(loginToken);

                payload = {
                    id: userAccount.user_id
                }
            } catch (e) {
                return res._failValidationError({message: 'Die Zugangsdaten sind nicht gültig oder der lokale Authenticator ist nicht erreichbar.'});
            }
        } else {
            const userRepository = getCustomRepository<UserRepository>(UserRepository);
            const localUser = await userRepository.findByCredentials(name, password);

            if(typeof localUser === 'undefined') {
                return res._failValidationError({message: 'Der Benutzer oder das Passwort ist falsch...'});
            }

            payload = {
                id: localUser.id
            }
        }
    } catch (e) {
        return res._failValidationError({message: e.message});
    }

    const {
        token,
        expiresIn
    } = await createToken(payload);

    const cookie = {
        accessToken: token,
        meta: {
            expireDate: new Date(Date.now() + (1000 * expiresIn)).toString(),
            expiresIn
        }
    };

    res.cookie('auth_token', JSON.stringify(cookie), {
        maxAge: Date.now() + 1000 * expiresIn,
        path: '/'
    });

    res.cookie('auth_provider','local',{
        maxAge: Date.now() + 1000 * expiresIn,
        path: '/'
    });

    let ob = {
        token,
        expires_in: expiresIn
    };

    let tokenResponseSchema = new TokenResponseSchema();
    ob = tokenResponseSchema.applySchemaOnEntity(ob);

    return res._respond({
        data: ob
    });
};

//---------------------------------------------------------------------------------

const revokeToken = async (req: any, res: any) => {
    res.cookie('auth_token', null, {maxAge: Date.now()});
    return res._respond();
};

//---------------------------------------------------------------------------------

export default {
    grantToken,
    revokeToken
};
