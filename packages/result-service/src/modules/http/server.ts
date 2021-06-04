import http, {Server} from "http";
import {ExpressAppInterface} from "./express";

interface HttpServerContext {
    expressApp: ExpressAppInterface
}

export interface HttpServerInterface extends Server {

}

function createHttpServer({expressApp} : HttpServerContext) : HttpServerInterface {
    return new http.Server(expressApp);
}

export default createHttpServer;
