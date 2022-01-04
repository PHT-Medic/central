/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getCustomRepository, getRepository } from 'typeorm';

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import {
    MASTER_REALM_ID, OAuth2Provider, Oauth2ProviderAccount, Oauth2TokenResponse, TokenPayload, TokenVerificationPayload,
} from '@personalhealthtrain/ui-common';
import { createToken, verifyToken } from '@typescript-auth/server';
import { Oauth2Client } from '@typescript-auth/core';
import { BadRequestError, UnauthorizedError } from '@typescript-error/http';
import { getWritableDirPath } from '../../../config/paths';
import { createOauth2ProviderAccountWithToken } from '../../../domains/auth/oauth2-provider-account/utils';
import { ExpressRequest, ExpressResponse } from '../../../config/http/type';
import env from '../../../env';
import { UserRepository } from '../../../domains/auth/user/repository';

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

async function grantTokenHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
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
        } as Oauth2TokenResponse,
    });
}

// ---------------------------------------------------------------------------------

async function revokeTokenHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    res.cookie('auth_token', null, { maxAge: 0 });
    return res.respondDeleted();
}

// ---------------------------------------------------------------------------------

async function verifyTokenHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    let tokenPayload : TokenPayload;

    try {
        tokenPayload = await verifyToken(id, {
            directory: getWritableDirPath(),
        });
    } catch (e) {
        throw new BadRequestError('The token is not valid....');
    }

    // todo: sub can also be client i.g.

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const userQuery = userRepository.createQueryBuilder('user')
        .addSelect('user.email')
        .where('user.id = :id', { id: tokenPayload.sub });

    const user = await userQuery.getOne();

    if (typeof user === 'undefined') {
        throw new UnauthorizedError();
    }

    const permissions = await userRepository.getOwnedPermissions(user.id);

    return res.respond({
        data: {
            token: tokenPayload,
            target: {
                type: 'user',
                data: {
                    ...user,
                    permissions,
                },
            },
        } as TokenVerificationPayload,
    });
}

@SwaggerTags('auth')
@Controller('/token')
export class TokenController {
    @Post('')
    async addToken(
        @Body() credentials: { username: string, password: string, provider?: string },
            @Request() req: any,
            @Response() res: any,
    ) : Promise<Oauth2TokenResponse> {
        return grantTokenHandler(req, res);
    }

    @Delete('')
    async dropToken(
        @Request() req: any,
            @Response() res: any,
    ) : Promise<void> {
        return revokeTokenHandler(req, res);
    }

    @Get('/:id')
    async verifyToken(
        @Request() req: any,
            @Response() res: any,
            @Params() id: string,
    ) : Promise<Oauth2TokenResponse> {
        return verifyTokenHandler(req, res);
    }
}
