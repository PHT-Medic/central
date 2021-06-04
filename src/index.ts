import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import env from './env';

import createConfig from "./config";
import createExpressApp from "./modules/http/express";
import createHttpServer from "./modules/http/server";
import createApolloServer from "./modules/http/apollo";
import {createConnection} from "typeorm";
import {useLogger} from "./modules/log";

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

        createApolloServer({config, expressApp});

        httpServer.listen(env.port, signalStart);
    }

    function signalStart() {
        useLogger().debug('Startup on 127.0.0.1:'+env.port+' ('+env.env+') completed.', {service: 'system'});
    }

    await createConnection();
    start();
})();
