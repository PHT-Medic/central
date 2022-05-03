/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';
import { TooManyRequestsError } from '@typescript-error/http';
import { ServiceID } from '@personalhealthtrain/central-common';
import { MASTER_REALM_ID } from '@authelion/common';
import { ExpressNextFunction, ExpressRequest, ExpressResponse } from '../type';

export function useRateLimiter(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    const limiter : RequestHandler = rateLimit({
        windowMs: 10 * 60 * 1000, // 10 minutes = 600 sec

        max(req: ExpressRequest) {
            if (req.userId) {
                return 100 * 60; // 6.000 req = 10 req p. sec
            }

            if (req.robot) {
                if (
                    req.robot.name === ServiceID.SYSTEM &&
                    req.robot.realm_id === MASTER_REALM_ID
                ) {
                    return 0; // unlimited req p. sec
                }

                return 1000 * 60; // 60.000 req = 100 req p. sec
            }

            return 5 * 60; // 300 req = 1/2 req p. sec
        },

        handler(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): any {
            next(new TooManyRequestsError());
        },
    });

    return limiter(req, res, next);
}
