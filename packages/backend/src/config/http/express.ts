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
import { getMiddleware } from 'swagger-stats';
import { setupAuthMiddleware } from '@typescript-auth/server';
import { AuthorizationHeader } from '@typescript-auth/core';
import { getPublicDirPath, getWritableDirPath } from '../paths';
import env from '../../env';
import { useLogger } from '../../modules/log';
import responseMiddleware from './middleware/response';

import { generateSwaggerDocumentation } from './swagger';
import { registerControllers } from './routes';

import { authenticateWithAuthorizationHeader, parseCookie } from './auth/utils';
import { errorMiddleware } from './middleware/error';
import { ExpressRequest } from './type';

export interface ExpressAppInterface extends Express{

}

async function createExpressApp() : Promise<ExpressAppInterface> {
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
        authenticateWithAuthorizationHeader: (request: ExpressRequest, value: AuthorizationHeader) => authenticateWithAuthorizationHeader(request, value),
    }));

    let swaggerDocument : any;

    if (env.swaggerDocumentation) {
        useLogger().debug('craeting swagger documentation', { service: 'express' });

        const swaggerDocumentPath: string = await generateSwaggerDocumentation();
        swaggerDocument = require(path.join(swaggerDocumentPath, 'swagger.json'));
    } else {
        const swaggerDocumentPath: string = path.join(getWritableDirPath(), 'swagger.json');
        if (existsSync(swaggerDocumentPath)) {
            swaggerDocument = require(swaggerDocumentPath);
        }
    }

    if (typeof swaggerDocument !== 'undefined') {
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

        expressApp.use(getMiddleware({
            uriPath: '/stats',
            swaggerSpec: swaggerDocument,
            name: 'stats',
        }));
    }

    registerControllers(expressApp);

    expressApp.use(errorMiddleware);

    return expressApp;
}

export default createExpressApp;
