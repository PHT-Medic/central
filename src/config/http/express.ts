import express, { Express } from 'express';
import cors from 'cors';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { registerRoutes } from './routes';

export type ExpressAppInterface = Express;

function createExpressApp() : ExpressAppInterface {
    const expressApp : Express = express();
    expressApp.use(cors());

    // Payload parser
    expressApp.use(bodyParser.urlencoded({ extended: false }));
    expressApp.use(bodyParser.json());

    // Cookie parser
    expressApp.use(cookieParser());

    // Loading routes
    registerRoutes(expressApp);

    return expressApp;
}

export default createExpressApp;
