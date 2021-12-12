/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getCustomRepository, getRepository } from 'typeorm';

import {
    Body, Controller, Delete, Post, Request, Response,
} from '@decorators/express';
import { ResponseExample, SwaggerTags } from '@trapi/swagger';
import {
    MASTER_REALM_ID, OAuth2Provider, Oauth2ProviderAccount, TokenPayload,
} from '@personalhealthtrain/ui-common';
import { createToken } from '@typescript-auth/server';
import { Oauth2Client } from '@typescript-auth/core';
import { BadRequestError } from '@typescript-error/http';
import { getWritableDirPath } from '../../../../config/paths';
import { createOauth2ProviderAccountWithToken } from '../../../../domains/auth/oauth2-provider-account/utils';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import env from '../../../../env';
import { UserRepository } from '../../../../domains/auth/user/repository';

/* istanbul ignore next */
async function grantTokenWithMasterProvider(username: string, password: string) : Promise<Oauth2ProviderAccount | undefined> {
    const providerRepository = getRepository(OAuth2Provider);
    const providers = await providerRepository.createQueryBuilder('provider')
        .leftJoinAndSelect('provider.realm', 'realm')
        .andWhere('provider.realm_id = :realmId', { realmId: MASTER_REALM_ID })
        .getMany();

    for (let i = 0; i < providers.length; i++) {
        const oauth2Client = new Oauth2Client(providers[i]);

        try {
            const tokenResponse = await oauth2Client.getTokenWithPasswordGrant({
                username,
                password,
            });

            return await createOauth2ProviderAccountWithToken(providers[i], tokenResponse);
        } catch (e) {
            // ...
            // todo: don't handle error, maybe log it.
        }
    }

    return undefined;
}

async function grantToken(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { username, password } = req.body;

    let userId: number | undefined;

    // try database authentication
    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const user = await userRepository.verifyCredentials(username, password);

    if (typeof user !== 'undefined') {
        userId = user.id;
    }

    /* istanbul ignore next */
    if (typeof userId === 'undefined') {
        const userAccount = await grantTokenWithMasterProvider(username, password);
        if (typeof userAccount !== 'undefined') {
            userId = userAccount?.user_id ?? userAccount?.user?.id;
        }
    }

    if (typeof userId === 'undefined') {
        throw new BadRequestError('The credentials are not valid.');
    }

    const expiresIn: number = env.jwtMaxAge;

    const tokenPayload: TokenPayload = {
        iss: env.apiUrl,
        sub: userId,
        remoteAddress: req.ip,
    };

    const token = await createToken(tokenPayload, expiresIn, { directory: getWritableDirPath() });

    return res.respond({
        data: {
            access_token: token,
            expires_in: expiresIn,
        },
    });
}

// ---------------------------------------------------------------------------------

async function revokeToken(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    res.cookie('auth_token', null, { maxAge: 0 });
    return res.respondDeleted();
}

// ---------------------------------------------------------------------------------

type Token = {
    /* @IsInt */
    expires_in: number,
    token: string
};

@SwaggerTags('auth')
@Controller('/token')
export class TokenController {
    @Post('')
    @ResponseExample<Token>({ expires_in: 3600, token: '20f81b13d51c65798f05' })
    async addToken(
        @Body() credentials: { username: string, password: string, provider?: string },
            @Request() req: any,
            @Response() res: any,
    ) : Promise<Token> {
        return grantToken(req, res);
    }

    @Delete('')
    async dropToken(
        @Request() req: any,
            @Response() res: any,
    ) : Promise<void> {
        return revokeToken(req, res);
    }
}
