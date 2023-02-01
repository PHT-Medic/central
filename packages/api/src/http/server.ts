/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import http, { Server } from 'node:http';
import { Router } from 'routup';
import { useLogger } from '../config';

interface HttpServerContext {
    router: Router
}

export interface HttpServerInterface extends Server {

}

export function createHttpServer({ router } : HttpServerContext) : HttpServerInterface {
    useLogger().debug('setup http server...', { service: 'http' });

    return new http.Server(router.createListener());
}
