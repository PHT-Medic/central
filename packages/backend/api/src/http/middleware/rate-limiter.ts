/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import rateLimit from 'express-rate-limit';
import { TooManyRequestsError } from '@ebec/http';
import { ServiceID } from '@personalhealthtrain/central-common';
import { MASTER_REALM_ID } from '@authelion/common';
import {
    Handler, Next, Request, Response, getRequestIp,
} from 'routup';
import { useRequestEnv } from '../request';

export function useRateLimiter(req: Request, res: Response, next: Next) {
    const limiter : Handler = rateLimit({
        windowMs: 10 * 60 * 1000, // 10 minutes = 600 sec

        max(req: Request) {
            if (useRequestEnv(req, 'userId')) {
                return 100 * 60; // 6.000 req = 10 req p. sec
            }

            const robot = useRequestEnv(req, 'robot');
            if (robot) {
                if (
                    robot.name === ServiceID.SYSTEM &&
                    robot.realm_id === MASTER_REALM_ID
                ) {
                    return 0; // unlimited req p. sec
                }

                return 1000 * 60; // 60.000 req = 100 req p. sec
            }

            return 5 * 60; // 300 req = 1/2 req p. sec
        },

        handler(req: Request, res: Response, next: Next): any {
            next(new TooManyRequestsError());
        },
        keyGenerator: (req: Request, res: Response) => getRequestIp(req, { trustProxy: true }),
    });

    return limiter(req, res, next);
}
