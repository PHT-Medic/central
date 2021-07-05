import {getCustomRepository, getRepository} from "typeorm";
import {UserRepository} from "../../../../domains/user/repository";
import {Provider} from "../../../../domains/provider";
import {Oauth2PasswordProvider} from "../../../../modules/auth/providers";

import {Response, Request, Controller, Post, Body, Delete} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";
import env from "../../../../env";
import {createToken} from "@typescript-auth/server";
import {getWritableDirPath} from "../../../../config/paths";
import {MASTER_REALM_ID} from "../../../../domains/realm";


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

async function grantTokenWithMasterProvider(username: string, password: string) : Promise<number | undefined> {
    const providerRepository = getRepository(Provider);
    const providers = await providerRepository.createQueryBuilder('provider')
        .leftJoinAndSelect('provider.realm', 'realm')
        .andWhere("provider.realm_id = :realmId", {realmId: MASTER_REALM_ID})
        .getMany();

    for(let i=0; i<providers.length; i++) {
        const oauth2Provider = new Oauth2PasswordProvider(providers[i]);

        try {
            const loginToken = await oauth2Provider.getToken(username, password);
            const userAccount = await oauth2Provider.loginWithToken(loginToken);

            return userAccount.user_id;
        } catch (e) {
            // don't handle error, maybe log it.
        }
    }

    return undefined;
}

async function grantToken(req: any, res: any) : Promise<any> {
    const {username, password} = req.body;

    let userId : number | undefined;

    // try database authentication
    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const user = await userRepository.findByCredentials(username, password);
    if(typeof user !== 'undefined') {
        userId = user.id;
    }

    if(typeof userId === 'undefined') {
        userId = await grantTokenWithMasterProvider(username, password);
    }

    if(typeof userId === 'undefined') {
        return res._failValidationError({message: 'The credentials are not valid.'})
    }

    const tokenPayload : {id: number, remoteAddress: string} = {
        id: userId,
        remoteAddress: req.ip
    };

    const expiresIn : number = env.jwtMaxAge;
    const token = await createToken(tokenPayload, expiresIn, {directory: getWritableDirPath()});

    return res._respond({
        data: {
            access_token: token,
            expires_in: expiresIn
        }
    });
}

// ---------------------------------------------------------------------------------

async function revokeToken(req: any, res: any) {
    res.cookie('auth_token', null, {maxAge: 0});
    return res._respond();
}
