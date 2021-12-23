/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Middleware } from '@decorators/express';
import { UnauthorizedError } from '@typescript-error/http';
import { AbilityManager, AuthorizationHeader } from '@typescript-auth/core';
import { Client, MASTER_REALM_ID, TokenPayload } from '@personalhealthtrain/ui-common';
import { verifyToken } from '@typescript-auth/server';
import { getCustomRepository, getRepository } from 'typeorm';
import { getWritableDirPath } from '../../paths';
import { ExpressNextFunction, ExpressRequest, ExpressResponse } from '../type';
import { UserRepository } from '../../../domains/auth/user/repository';

export function forceLoggedIn(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    if (
        typeof req.userId === 'undefined' &&
        typeof req.serviceId === 'undefined'
    ) {
        throw new UnauthorizedError('You are not authenticated.');
    }

    next();
}

export class ForceLoggedInMiddleware implements Middleware {
    // eslint-disable-next-line class-methods-use-this
    public use(request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction) {
        return forceLoggedIn(request, response, next);
    }
}

const ip4ToInt = (ip: string) => ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
const isIp4InCidr = (ip: string, cidr: string) => {
    const [range, bits = 32] = cidr.split('/');
    const mask = ~(2 ** (32 - Number(bits)) - 1);
    return (ip4ToInt(ip) & mask) === (ip4ToInt(range) & mask);
};

export async function authenticateWithAuthorizationHeader(request: any, value: AuthorizationHeader): Promise<void> {
    // eslint-disable-next-line default-case
    switch (value.type) {
        case 'Bearer': {
            let tokenPayload: TokenPayload;

            try {
                tokenPayload = await verifyToken(value.token, {
                    directory: getWritableDirPath(),
                });
            } catch (e) {
                return;
            }

            const { sub: userId } = tokenPayload;

            if (typeof userId === 'undefined' || typeof tokenPayload.remoteAddress !== 'string') {
                return;
            }

            // remove ipv6 space from embedded ipv4 address
            const tokenAddress = tokenPayload.remoteAddress.replace('::ffff:', '');
            const currentAddress: string = request.ip.replace('::ffff:', '');

            if (
                // ipv4 + ipv6 local addresses
                ['::1', '127.0.0.1'].indexOf(currentAddress) === -1 &&
                tokenAddress !== currentAddress &&
                // allow private network addresses, maybe explicit whitelist possible frontend ip addresses instead.
                !isIp4InCidr(currentAddress, '10.0.0.0/8') &&
                !isIp4InCidr(currentAddress, '172.16.0.0/12') &&
                !isIp4InCidr(currentAddress, '192.168.0.0/16')
            ) {
                // todo: removed for dmz proxy setting
                // throw new UnauthorizedError();
            }

            const userRepository = getCustomRepository<UserRepository>(UserRepository);
            const userQuery = userRepository.createQueryBuilder('user')
                .addSelect('user.email')
                .where('user.id = :id', { id: userId });

            const user = await userQuery.getOne();

            if (typeof user === 'undefined') {
                throw new UnauthorizedError();
            }

            const permissions = await userRepository.getOwnedPermissions(user.id);

            request.user = user;
            request.userId = user.id;
            request.realmId = user.realm_id;

            request.ability = new AbilityManager(permissions);
            break;
        }
        case 'Basic': {
            const clientRepository = getRepository(Client);
            const client = await clientRepository.findOne({
                id: value.username,
                secret: value.password,
            });

            if (typeof client !== 'undefined') {
                if (!client.service_id) {
                    // only allow services for now... ^^
                    return;
                }

                request.serviceId = client.service_id;
                // SERVICES are always central services ;)
                request.realmId = MASTER_REALM_ID;

                request.ability = new AbilityManager([]);

                return;
            }

            const userRepository = getCustomRepository<UserRepository>(UserRepository);
            const user = await userRepository.verifyCredentials(value.username, value.password);

            if (typeof user === 'undefined') {
                throw new UnauthorizedError();
            }

            const permissions = await userRepository.getOwnedPermissions(user.id);

            request.user = user;
            request.userId = user.id;
            request.realmId = user.realm_id;

            request.ability = new AbilityManager(permissions);
            break;
        }
    }
}

export function parseCookie(request: any): string | undefined {
    try {
        if (typeof request.cookies?.auth_token !== 'undefined') {
            const { access_token: accessToken } = JSON.parse(request.cookies?.auth_token);

            return accessToken;
        }
    } catch (e) {
        // don't handle error, this is just fine :)
    }

    return undefined;
}
