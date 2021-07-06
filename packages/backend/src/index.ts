import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import env from './env';

import createConfig from "./config";
import createExpressApp from "./config/http/express";
import createHttpServer from "./config/http/server";
import {useLogger} from "./modules/log";

import {createConnection} from "typeorm";
import {buildConnectionOptions} from "typeorm-extension";

(async () => {
    /*
    HTTP Server & Express App
    */
    const config = createConfig({env});
    const expressApp = await createExpressApp();
    const httpServer = createHttpServer({expressApp});

    /*
    Start Server
    */
    function start() {
        config.components.forEach(c => c.start());
        config.aggregators.forEach(a => a.start());

        httpServer.listen(env.port, signalStart);
    }

    function signalStart() {
        useLogger().debug('Startup on 127.0.0.1:'+env.port+' ('+env.env+') completed.', {service: 'system'});
    }

    const connectionOptions = await buildConnectionOptions();
    const connection = await createConnection(connectionOptions);
    if(process.env.NODE_ENV === 'development') {
        await connection.synchronize();
    }
    start();
})();
