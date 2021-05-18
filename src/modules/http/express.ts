import express, {Express, Response, Request, NextFunction, static as expressStatic } from "express";
import cors from "cors";

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import {getPublicDirPath, getWritableDirPath} from "../../config/paths";
import path from "path";
import swaggerUi from 'swagger-ui-express';
import env from "../../env";
import {useLogger} from "../log";
import {attachControllers} from "@decorators/express";
import responseMiddleware from "./response/middleware/responseMiddleware";
import {TokenController} from "../../app/controllers/auth/token/TokenController";
import {existsSync} from "fs";

import {checkAuthenticated} from "./request/middleware/authMiddleware";
import {generateSwaggerDocumentation} from "./swagger";
import {UserController} from "../../app/controllers/user/UserController";
import {UserKeyController} from "../../app/controllers/user/key/UserKeyController";
import {PermissionController} from "../../app/controllers/permission/PermissionController";
import {ProviderController} from "../../app/controllers/auth/ProviderController";
import {RealmController} from "../../app/controllers/auth/realm/RealmController";


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

    //router.registerRoutes(expressApp);

    expressApp.use(responseMiddleware);
    expressApp.use(checkAuthenticated);

    attachControllers(expressApp, [
        // Auth Controllers
        TokenController,
        RealmController,
        ProviderController,

        PermissionController,
        UserController,
        UserKeyController
    ]);

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
    }

    return expressApp;
}

export default createExpressApp;
