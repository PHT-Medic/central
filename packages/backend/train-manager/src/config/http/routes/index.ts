/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Application } from 'express';
import { setupTrainResultRoutes } from './train-results';
import responseMiddleware from '../middleware/response';

export function registerRoutes(router: Application) {
    router.use(responseMiddleware);

    router.use('/train-results', setupTrainResultRoutes());
}
