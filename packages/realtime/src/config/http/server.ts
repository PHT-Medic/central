/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Server } from 'node:http';
import http from 'node:http';

export function createHttpServer() : Server {
    return new http.Server();
}
