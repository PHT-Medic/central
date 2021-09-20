import {getCustomRepository, getRepository} from "typeorm";
import {UserRepository} from "../../../../domains/auth/user/repository";
import {OAuth2Provider} from "../../../../domains/auth/oauth2-provider";

import {Response, Request, Controller, Post, Body, Delete} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";
import env from "../../../../env";
import {createToken} from "@typescript-auth/server";
import {getWritableDirPath} from "../../../../config/paths";
import {MASTER_REALM_ID} from "../../../../domains/auth/realm";
import {Oauth2Client} from "@typescript-auth/core";
import {Oauth2ProviderAccount} from "../../../../domains/auth/oauth2-provider/account";
import {createOauth2ProviderAccountWithToken} from "../../../../domains/auth/oauth2-provider/account/utils";
import {TokenPayload} from "../../../../domains/auth/token/type";
import {buildTokenPayload} from "../../../../domains/auth/token";


type Token = {
    /* @IsInt */
    expires_in: number,
    token: string
}

@SwaggerTags('auth')
@Controller("/token")
export class TokenController {
    @Post("")
    @ResponseExample<Token>({expires_in: 3600, token: '20f81b13d51c65798f05'})
    async addToken(
        @Body() credentials: { username: string, password: string, provider?: string },
        @Request() req: any,
        @Response() res: any
    ) : Promise<Token>  {
        return (await grantToken(req,res)) as Token;
    }

    @Delete("")
    async dropToken(
        @Request() req: any,
        @Response() res: any
    ) : Promise<void> {
        return await revokeToken(req, res);
    }
}

async function grantTokenWithMasterProvider(username: string, password: string) : Promise<Oauth2ProviderAccount | undefined> {
    const providerRepository = getRepository(OAuth2Provider);
    const providers = await providerRepository.createQueryBuilder('provider')
        .leftJoinAndSelect('provider.realm', 'realm')
        .andWhere("provider.realm_id = :realmId", {realmId: MASTER_REALM_ID})
        .getMany();

    for(let i=0; i<providers.length; i++) {
        const oauth2Client = new Oauth2Client(providers[i]);

        try {
            const tokenResponse = await oauth2Client.getTokenWithPasswordGrant({
                username,
                password
            });

            return await createOauth2ProviderAccountWithToken(providers[i], tokenResponse);
        } catch (e) {
            console.log(e);
            // don't handle error, maybe log it.
        }
    }

    return undefined;
}

async function grantToken(req: any, res: any) : Promise<any> {
    const {username, password} = req.body;

    try {
        let userId: number | undefined;

        // try database authentication
        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        const user = await userRepository.verifyCredentials(username, password);

        if (typeof user !== 'undefined') {
            userId = user.id;
        }

        if (typeof userId === 'undefined') {
            const userAccount = await grantTokenWithMasterProvider(username, password);
            if(typeof userAccount !== 'undefined') {
                userId = userAccount?.user_id ?? userAccount?.user?.id;
            }
        }

        if (typeof userId === 'undefined') {
            return res._failValidationError({message: 'The credentials are not valid.'})
        }

        const expiresIn: number = env.jwtMaxAge;

        const tokenPayload: TokenPayload = buildTokenPayload({
            sub: userId,
            remoteAddress: req.ip
        }, expiresIn);

        const token = await createToken(tokenPayload, expiresIn, {directory: getWritableDirPath()});

        return res._respond({
            data: {
                access_token: token,
                expires_in: expiresIn
            }
        });
    } catch (e) {
        return res._failServerError();
    }
}

// ---------------------------------------------------------------------------------

async function revokeToken(req: any, res: any) {
    res.cookie('auth_token', null, {maxAge: 0});
    return res._respond();
}
