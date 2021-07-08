import express, {Express, static as expressStatic } from "express";
import cors from "cors";

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import {getPublicDirPath} from "../paths";
import {registerRoutes} from "./routes";

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

    expressApp.use('/public', expressStatic(getPublicDirPath()))

    // Loading routes

    registerRoutes(expressApp);

    return expressApp;
}

export default createExpressApp;
