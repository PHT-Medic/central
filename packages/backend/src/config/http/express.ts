/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import express, { Express, static as expressStatic } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { existsSync } from 'fs';
import { setupAuthMiddleware } from '@typescript-auth/server';
import { AuthorizationHeader } from '@typescript-auth/core';
import promBundle from 'express-prom-bundle';
import { getPublicDirPath, getWritableDirPath } from '../paths';
import env from '../../env';
import { useLogger } from '../../modules/log';
import responseMiddleware from './middleware/response';

import { registerControllers } from './routes';

import { authenticateWithAuthorizationHeader, parseCookie } from './auth/utils';
import { errorMiddleware } from './middleware/error';
import { ExpressRequest } from './type';

export interface ExpressAppInterface extends Express{

}

function createExpressApp() : ExpressAppInterface {
    useLogger().debug('setup express app...', { service: 'express' });
    const expressApp : Express = express();

    expressApp.use(cors({
        origin(origin, callback) {
            callback(null, true);
        },
        credentials: true,
    }));

    // Payload parser
    expressApp.use(bodyParser.urlencoded({ extended: false }));
    expressApp.use(bodyParser.json());

    // Cookie parser
    expressApp.use(cookieParser());

    expressApp.use('/public', expressStatic(getPublicDirPath()));

    // Loading routes

    expressApp.use(responseMiddleware);

    expressApp.use(setupAuthMiddleware({
        parseCookie: (request: ExpressRequest) => parseCookie(request),
        authenticateWithAuthorizationHeader: (
            request: ExpressRequest,
            value: AuthorizationHeader,
        ) => authenticateWithAuthorizationHeader(request, value),
    }));

    if (
        env.swaggerDocumentation
        && env.env !== 'test'
    ) {
        const swaggerDocumentPath: string = path.join(getWritableDirPath(), 'swagger.json');
        if (existsSync(swaggerDocumentPath)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require, import/no-dynamic-require
            const swaggerDocument = require(swaggerDocumentPath);

            expressApp.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
                swaggerOptions: {
                    withCredentials: true,
                    plugins: [
                        () => ({
                            components: { Topbar: (): any => null },
                        }),
                    ],
                },
            }));
        }
    }

    const metricsMiddleware = promBundle({
        includeMethod: true,
        includePath: true,
    });

    expressApp.use(metricsMiddleware);

    registerControllers(expressApp);

    expressApp.use(errorMiddleware);

    return expressApp;
}

export default createExpressApp;
