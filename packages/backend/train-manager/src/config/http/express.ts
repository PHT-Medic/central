/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import express, { Express } from 'express';
import cors from 'cors';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { setupHTTPMiddleware } from '@authelion/server-adapter';
import { useLogger } from '../../modules/log';
import { registerRoutes } from './routes';
import { ExpressAppContext, ExpressAppInterface } from './type';
import { errorMiddleware, useRateLimiter } from './middleware';
import env from '../../env';

function createExpressApp(context: ExpressAppContext) : ExpressAppInterface {
    const expressApp : Express = express();
    expressApp.use(cors());

    // Payload parser
    expressApp.use(bodyParser.urlencoded({ extended: false }));
    expressApp.use(bodyParser.json());

    // Cookie parser
    expressApp.use(cookieParser());

    if (env.env !== 'test') {
        // Rate Limiter
        expressApp.use(useRateLimiter);
    }

    expressApp.use(setupHTTPMiddleware({
        redis: context.config.redis,
        oauth2: env.apiUrl, // todo: check if all realms supported
        logger: useLogger(),
    }));

    // Loading routes
    registerRoutes(expressApp);

    // registering error middleware
    expressApp.use(errorMiddleware);

    return expressApp;
}

export default createExpressApp;
