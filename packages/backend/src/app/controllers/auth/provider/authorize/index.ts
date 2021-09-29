/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {TokenPayload} from "@personalhealthtrain/ui-common";
import {getRepository} from "typeorm";
import {Oauth2Client, Oauth2TokenResponse} from "@typescript-auth/core";
import {createToken} from "@typescript-auth/server";
import {OAuth2Provider} from "@personalhealthtrain/ui-common";

import env from "../../../../../env";
import {getWritableDirPath} from "../../../../../config/paths";

import {createOauth2ProviderAccountWithToken} from "../../../../../domains/auth/oauth2-provider-account/utils";

export async function authorizeUrlRoute(req: any, res: any) {
    const {id} = req.params;

    const repository = getRepository(OAuth2Provider);
    const provider = await repository.createQueryBuilder('provider')
        .leftJoinAndSelect('provider.realm', 'realm')
        .where('provider.id = :id', {id})
        .getOne();

    if (typeof provider === 'undefined') {
        return res._failNotFound();
    }

    try {
        const oauth2Client = new Oauth2Client({
            client_id: provider.client_id,
            token_host: provider.token_host,
            authorize_host: provider.authorize_host,
            authorize_path: provider.authorize_path,
            redirect_uri: env.apiUrl + '/providers/' + provider.id + '/authorize-callback'
        });

        return res.redirect(oauth2Client.buildAuthorizeURL({}));
    } catch (e) {
        return res._failServerError();
    }
}

export async function authorizeCallbackRoute(req: any, res: any) {
    const {id} = req.params;
    const {code, state} = req.query;

    const repository = getRepository(OAuth2Provider);
    const provider = await repository.createQueryBuilder('provider')
        .addSelect('provider.client_secret')
        .leftJoinAndSelect('provider.realm', 'realm')
        .where('provider.id = :id', {id})
        .getOne();

    if (typeof provider === 'undefined') {
        return res._failNotFound();
    }

    try {

        const oauth2Client = new Oauth2Client({
            client_id: provider.client_id,
            client_secret: provider.client_secret,

            token_host: provider.token_host,
            token_path: provider.token_path,

            redirect_uri: env.apiUrl + '/providers/' + provider.id + '/authorize-callback'
        });

        const tokenResponse : Oauth2TokenResponse = await oauth2Client.getTokenWithAuthorizeGrant({
            code,
            state
        });

        if(typeof tokenResponse.access_token_payload === 'undefined') {
            return res._failServerError({message: 'The accessToken could not be decoded.'});
        }

        const account = await createOauth2ProviderAccountWithToken(provider, tokenResponse);
        const expiresIn = env.jwtMaxAge;

        const tokenPayload : TokenPayload = {
            iss: env.apiUrl,
            sub: account.user.id,
            remoteAddress: req.ip
        };

        const token = await createToken(tokenPayload, expiresIn,{directory: getWritableDirPath()});

        const cookie : Oauth2TokenResponse = {
            access_token: token,
            expires_in: expiresIn,
            token_type: 'Bearer'
        };

        res.cookie('auth_token', JSON.stringify(cookie), {
            maxAge: expiresIn * 1000
        });

        return res.redirect(env.webAppUrl);
    } catch (e) {
        console.log(e);
        return res._failValidationError({message: 'The provider authorization did not succeed.'});
    }
}
