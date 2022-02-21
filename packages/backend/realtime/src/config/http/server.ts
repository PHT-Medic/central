/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import http, { Server } from 'http';
import { useLogger } from '../log';

export function createHttpServer() : Server {
    useLogger().debug('setup http server...', { service: 'http' });

    return new http.Server();
}
