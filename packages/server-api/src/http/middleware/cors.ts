/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import cors from 'cors';
import { coreHandler } from 'routup';
import type { Router } from 'routup';

export function registerCorsMiddleware(router: Router) {
    router.use(coreHandler((req, res, next) => cors({
        origin(origin, callback) {
            callback(null, true);
        },
        credentials: true,
    })(req, res, next)));
}
