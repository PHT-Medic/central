import express, {Express, Response, Request, NextFunction, static as expressStatic } from "express";
import expressFileUpload from 'express-fileupload';
import cors from "cors";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import router from './../../services/router';
import {getPublicDirPath} from "../../config/paths";

export interface ExpressAppInterface extends Express{

}

function createExpressApp() : ExpressAppInterface {
    const expressApp : Express = express();
    expressApp.use(cors());

    // Payload parser
    expressApp.use(bodyParser.urlencoded({extended: false}));
    expressApp.use(bodyParser.json());

    // Cookie parser
    expressApp.use(cookieParser());

    expressApp.use(expressFileUpload());

    expressApp.use('/public', expressStatic(getPublicDirPath()))

    expressApp.use(function (req: Request, res: Response, next: NextFunction) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        next();
    });

    // Loading routes

    router.registerRoutes(expressApp);

    return expressApp;
}

export default createExpressApp;
