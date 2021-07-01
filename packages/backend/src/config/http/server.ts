import http, {Server} from "http";
import {ExpressAppInterface} from "./express";
import {useLogger} from "../../modules/log";

interface HttpServerContext {
    expressApp: ExpressAppInterface
}

export interface HttpServerInterface extends Server {

}

function createHttpServer({expressApp} : HttpServerContext) : HttpServerInterface {
    useLogger().debug('setup http server...', {service: 'http'});

    return new http.Server(expressApp);
}

export default createHttpServer;
