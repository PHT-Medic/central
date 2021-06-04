import express, {Express, Response, Request, NextFunction, static as expressStatic } from "express";
import cors from "cors";

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import {getPublicDirPath, getWritableDirPath} from "../../config/paths";
import path from "path";
import swaggerUi from 'swagger-ui-express';
import env from "../../env";
import {useLogger} from "../log";
import responseMiddleware from "./response/middleware/responseMiddleware";
import {existsSync} from "fs";

import {checkAuthenticated} from "./request/middleware/authMiddleware";
import {generateSwaggerDocumentation} from "./swagger";
import {registerControllers} from "../../config/routing";


import {getMiddleware} from 'swagger-stats';
import exp from "constants";

export interface ExpressAppInterface extends Express{

}

function hasBody(req: any) {
    const encoding = 'transfer-encoding' in req.headers,
        length = 'content-length' in req.headers
            && req.headers['content-length'] !== '0';
    return encoding || length;
}

function mime(req: any) {
    const str = req.headers['content-type'] || '';
    return str.split(';')[0];
}

const RE_MIME = /^(?:multipart\/.+)|(?:application\/x-www-form-urlencoded)$/i;

async function createExpressApp() : Promise<ExpressAppInterface> {
    useLogger().debug('setup express app...', {service: 'express'});
    const expressApp : Express = express();
    expressApp.use(cors());

    // Payload parser
    expressApp.use(bodyParser.urlencoded({extended: false}));
    expressApp.use(bodyParser.json());

    // Cookie parser
    expressApp.use(cookieParser());

    //expressApp.use(fileUpload({uriDecodeFileNames: false, safeFileNames: false}));

    expressApp.use('/public', expressStatic(getPublicDirPath()))

    expressApp.use(function (req: Request, res: Response, next: NextFunction) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        next();
    });

    // Loading routes

    expressApp.use(responseMiddleware);
    expressApp.use(checkAuthenticated);

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

    registerControllers(expressApp);

    return expressApp;
}

export default createExpressApp;
