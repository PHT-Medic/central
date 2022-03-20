/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import http, { Server } from 'http';
import { ExpressAppInterface } from './type';

interface HttpServerContext {
    expressApp: ExpressAppInterface
}

export type HttpServerInterface = Server;

function createHttpServer({ expressApp } : HttpServerContext) : HttpServerInterface {
    return new http.Server(expressApp);
}

export default createHttpServer;
