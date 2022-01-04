/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import rateLimit, { Options } from 'express-rate-limit';
import { RequestHandler } from 'express';
import { TooManyRequestsError } from '@typescript-error/http';
import { ExpressNextFunction, ExpressRequest, ExpressResponse } from '../type';

export function useRateLimiter(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) {
    const limiter : RequestHandler = rateLimit({
        // 1/3 req p. sec
        windowMs: 15 * 60 * 1000, // 15 minutes = 900 sec

        max(req: ExpressRequest) {
            if (req.serviceId || req.userId) {
                return 150 * 60; // 9000 req
            }

            return 5 * 60; // 300 req
        },

        handler(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): any {
            next(new TooManyRequestsError());
        },
    });

    return limiter(req, res, next);
}
