/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import express, {Express, Response, Request, NextFunction, static as expressStatic } from "express";
import cors from "cors";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import {getPublicDirPath, getWritableDirPath} from "../paths";
import path from "path";
import swaggerUi from 'swagger-ui-express';
import env from "../../env";
import {useLogger} from "../../modules/log";
import responseMiddleware from "./middleware/response";
import {existsSync} from "fs";

import {generateSwaggerDocumentation} from "./swagger";
import {registerControllers} from "./routes";


import {getMiddleware} from 'swagger-stats';
import {setDefaultRequestKeyCase} from "typeorm-extension";
import {setupAuthMiddleware} from "@typescript-auth/server";
import {AuthorizationHeaderValue} from "@typescript-auth/core";

import {authenticateWithAuthorizationHeader, parseCookie} from "./auth/utils";
import {errorMiddleware} from "./middleware/error";

export interface ExpressAppInterface extends Express{

}

async function createExpressApp() : Promise<ExpressAppInterface> {
    useLogger().debug('setup express app...', {service: 'express'});
    const expressApp : Express = express();
    expressApp.use(cors());

    // Payload parser
    expressApp.use(bodyParser.urlencoded({extended: false}));
    expressApp.use(bodyParser.json());

    // Cookie parser
    expressApp.use(cookieParser());

    expressApp.use('/public', expressStatic(getPublicDirPath()))

    // Loading routes

    expressApp.use(responseMiddleware);

    expressApp.use(setupAuthMiddleware({
        parseCookie: (request: Request) => parseCookie(request),
        authenticateWithAuthorizationHeader: (request: Request, value: AuthorizationHeaderValue) => authenticateWithAuthorizationHeader(request, value)
    }));

    let swaggerDocument : any;

    if(env.swaggerDocumentation) {
        useLogger().debug('craeting swagger documentation', {service: 'express'});

        const swaggerDocumentPath: string = await generateSwaggerDocumentation();
        swaggerDocument = require(path.join(swaggerDocumentPath, 'swagger.json'));
    } else {
        const swaggerDocumentPath: string = path.join(getWritableDirPath(), 'swagger.json');
        if(existsSync(swaggerDocumentPath)) {
            swaggerDocument = require(swaggerDocumentPath);
        }
    }

    if(typeof swaggerDocument !== 'undefined') {
        expressApp.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
            swaggerOptions: {
                withCredentials: true,
                plugins: [
                    () => {
                        return {
                            components: {Topbar: (): any => null}
                        }
                    }
                ]
            }
        }));

        expressApp.use(getMiddleware({
            uriPath: '/stats',
            swaggerSpec: swaggerDocument,
            name: 'stats'
        }))
    }

    setDefaultRequestKeyCase("snakeCase");
    registerControllers(expressApp);

    expressApp.use(errorMiddleware);

    return expressApp;
}

export default createExpressApp;
