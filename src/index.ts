import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import createExpressApp from "./services/http/express";
import createHttpServer from "./services/http/server";

//--------------------------------------------------------------------
// HTTP Server & Express App
//--------------------------------------------------------------------
const expressApp = createExpressApp();
const httpServer = createHttpServer({expressApp});

//--------------------------------------------------------------------
// Start Server
//--------------------------------------------------------------------

import {Connection, createConnection} from "typeorm";
import createPHTResultService from "./services/pht/result";

createConnection().then((connection: Connection) => {
    httpServer.listen(process.env.PORT, () => {
        console.log('Listening on port: ' + process.env.PORT);
    });

    //createPHTResultService();
});
