/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { ErrorCode } from '@personalhealthtrain/central-common';
import { useClient } from 'redis-extension';
import type { Next, Request, Response } from 'routup';
import { useRequestPath } from 'routup';
import { useAuthupClient } from '../../core';
import { useRequestEnv } from '../request';

function buildRedisKey(id: string) {
    return `user-license-agreement:${id}`;
}
export function setupLicenseAgreementMiddleware() {
    const redis = useClient();

    return async (req: Request, res: Response, next: Next) => {
        const userId = useRequestEnv(req, 'userId');
        if (!userId) {
            next();
            return;
        }

        const url = useRequestPath(req);
        if (
            url.startsWith('/user-attributes') ||
            url.startsWith('/token') ||
            url.startsWith('/users/@me') ||
            url.startsWith('/identity-providers')
        ) {
            next();
        }

        const redisValue = await redis.exists(buildRedisKey(userId));
        if (redisValue === 1) {
            next();
            return;
        }

        const authupClient = useAuthupClient();
        const user = await authupClient.user.getOne('@me');
        if (
            typeof user.license_agreeement === 'string' &&
            user.license_agreement === 'accepted'
        ) {
            await redis.set(buildRedisKey(userId), 1, 'EX', 3600 * 24);
            next();
            return;
        }

        if (
            typeof user.license_agreeement !== 'string' ||
            user.license_agreement !== 'accepted'
        ) {
            next(new BadRequestError({
                code: ErrorCode.LICENSE_AGREEMENT,
                message: 'The license agreement must be accepted!',
            }));

            return;
        }

        next();
    };
}
