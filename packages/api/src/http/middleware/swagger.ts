/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createUIHandler } from '@routup/swagger';
import { loadSync } from 'locter';
import path from 'node:path';
import type { Router } from 'routup';
import { getWritableDirPath } from '../../config';

export function registerSwaggerMiddleware(router: Router) {
    const document = loadSync(path.join(getWritableDirPath(), 'swagger.json'));
    router.use('/docs', createUIHandler(document));
}
