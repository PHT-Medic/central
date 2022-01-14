/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AbilityManager } from '@typescript-auth/core';
import { BadRequestError, UnauthorizedError } from '@typescript-error/http';
import { RedisCache } from 'redis-extension';
import { Socket } from 'socket.io';
import { useTrapiClient } from '@trapi/client';
import { TokenAPI, TokenVerificationPayload } from '@typescript-auth/domains';
import { Config } from '../../../config';

export function useAuthMiddleware(config: Config) {
    const tokenCache = new RedisCache<string>({
        redis: config.redisDatabase,
    }, {
        prefix: 'token',
    });

    const tokenApi = new TokenAPI(useTrapiClient('default').driver);

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

        let cacheData : TokenVerificationPayload | undefined = await tokenCache.get(token);
        if (!cacheData) {
            let payload : TokenVerificationPayload;

            try {
                payload = await tokenApi.verify(token);
            } catch (e) {
                return next(new UnauthorizedError());
            }

            let secondsDiff : number = payload.token.exp - (new Date().getTime() / 1000);
            secondsDiff = parseInt(secondsDiff.toString(), 10);

            if (secondsDiff <= 0) {
                return next(new BadRequestError('The token has been expired.'));
            }

            await tokenCache.set(token, payload, { seconds: secondsDiff });
            cacheData = payload;
        }

        const { permissions, ...entity } = cacheData.entity.data;

        switch (cacheData.entity.type) {
            case 'robot':
                socket.data.robotId = entity.id;
                socket.data.robot = entity;
                break;
            case 'user':
                socket.data.userId = entity.id;
                socket.data.user = entity;
                break;
        }

        socket.data.token = token;
        socket.data.permissions = permissions;
        socket.data.ability = new AbilityManager(permissions);

        return next();
    };
}
