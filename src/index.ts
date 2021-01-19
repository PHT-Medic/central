import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import env from './env';

import createConfig from "./config";
import createExpressApp from "./modules/http/express";
import createHttpServer from "./modules/http/server";

//--------------------------------------------------------------------
// HTTP Server & Express App
//--------------------------------------------------------------------
const config = createConfig({env});
const expressApp = createExpressApp();
const httpServer = createHttpServer({expressApp});

//--------------------------------------------------------------------
// Start Server
//--------------------------------------------------------------------

import {Connection, createConnection} from "typeorm";
import createPHTResultService from "./modules/pht/result";

function start() {
    config.components.forEach(c => c.start());
    config.aggregators.forEach(a => a.start());

    httpServer.listen(env.port, signalStart);
}

function signalStart() {
    console.table([['Port', env.port], ['Environment', env.env]]);
}

createConnection().then(() => {
    start();

    createPHTResultService();
});
