/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { REALM_MASTER_NAME, ROBOT_SYSTEM_NAME } from '@authup/core';
import type { OptionsInput } from '@routup/rate-limit';
import {
    createHandler,
} from '@routup/rate-limit';
import type { Request, Router } from 'routup';
import { useRequestEnv } from '../request';

export function registerRateLimitMiddleware(router: Router) {
    const options : OptionsInput = {
        skip(req: Request) {
            const robot = useRequestEnv(req, 'robotId');
            if (robot) {
                const { name } = useRequestEnv(req, 'realm');

                if (
                    name === REALM_MASTER_NAME &&
                    useRequestEnv(req, 'robotName') === ROBOT_SYSTEM_NAME
                ) {
                    return true;
                }
            }

            return false;
        },
        max(req: Request) {
            if (useRequestEnv(req, 'userId')) {
                return 60 * 100; // 100 req p. sec
            }

            const robot = useRequestEnv(req, 'robotId');
            if (robot) {
                return 60 * 1000; // 1000 req p. sec
            }

            return 60 * 20; // 20 req p. sec
        },
        windowMs: 60 * 1000, // 60 sec
    };

    router.use(createHandler(options));
}
