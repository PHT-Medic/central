/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { ErrorCode } from '@personalhealthtrain/core';
import { useClient } from 'redis-extension';
import { coreHandler } from 'routup';
import type {
    Next, Request, Response, Router,
} from 'routup';
import { useAuthupClient } from '../../core';
import { useRequestEnv } from '../request';

function buildRedisKey(id: string) {
    return `user-license-agreement:${id}`;
}
export function registerLicenseAgreementMiddleware(router: Router) {
    const redis = useClient();

    router.use(coreHandler(async (req: Request, res: Response, next: Next) => {
        const userId = useRequestEnv(req, 'userId');
        if (!userId) {
            next();
            return;
        }

        const redisValue = await redis.exists(buildRedisKey(userId));
        if (redisValue === 1) {
            next();
            return;
        }

        const authupClient = useAuthupClient();
        const { data: userAttributes } = await authupClient.userAttribute.getMany({
            filter: {
                user_id: userId,
                name: 'license_agreement',
            },
        });

        if (
            userAttributes.length === 1 &&
            userAttributes[0].value === 'accepted'
        ) {
            await redis.set(buildRedisKey(userId), 1, 'EX', 3600 * 24);
            next();
            return;
        }

        next(new BadRequestError({
            code: ErrorCode.LICENSE_AGREEMENT,
            message: 'The license agreement must be accepted!',
        }));
    }));
}
