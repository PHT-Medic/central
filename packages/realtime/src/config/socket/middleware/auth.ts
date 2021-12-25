/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TokenVerificationPayload, verifyAPIToken } from '@personalhealthtrain/ui-common';
import { AbilityManager } from '@typescript-auth/core';
import { BadRequestError, UnauthorizedError } from '@typescript-error/http';
import { EntityCache } from 'redis-extension';
import { Socket } from 'socket.io';
import { Config } from '../../../config';

export function useAuthMiddleware(config: Config) {
    const tokenCache = new EntityCache<undefined, string>({
        redisDatabase: config.redisDatabase,
    }, {});

    tokenCache.startScheduler();

    return async (socket: Socket, next: (err?: Error) => void) => {
        const ip = socket.handshake.headers['x-real-ip'] ||
            socket.handshake.headers['x-forwarded-for'] ||
            socket.handshake.address;

        // todo: maybe check incoming ip ;)

        const { token } = socket.handshake.auth;

        if (!token) {
            return next();
        }

        try {
            let cacheData : TokenVerificationPayload | undefined = await tokenCache.get(token);
            if (!cacheData) {
                const data = await verifyAPIToken(token);

                let secondsDiff : number = data.token.exp - (new Date().getTime() / 1000);
                secondsDiff = parseInt(secondsDiff.toString(), 10);

                if (secondsDiff <= 0) {
                    throw new BadRequestError('The token has been expired.');
                }

                await tokenCache.set(token, data, { seconds: secondsDiff });
                cacheData = data;
            }

            const { permissions, ...user } = cacheData.target.data;

            socket.data.userId = user.id;
            socket.data.user = user;
            socket.data.permissions = permissions;
            socket.data.ability = new AbilityManager(permissions);

            return next();
        } catch (e) {
            return next(new UnauthorizedError());
        }
    };
}
