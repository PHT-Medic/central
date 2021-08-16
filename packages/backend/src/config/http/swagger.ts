import {generateDocumentation, SwaggerConfig} from "typescript-swagger";
import {getRootDirPath, getWritableDirPath} from "../paths";
import path from "path";
import env from "../../env";

const packageJson = require('../../../package.json');
const tsConfig = require('../../../tsconfig.json');

const url = new URL(env.apiUrl);
let host : string = (url.host + url.pathname).replace(/([^:]\/)\/+/g, "$1");
host = host.substr(-1, 1) === '/' ? host.substr(0, host.length -1) : host;

export const swaggerConfig : SwaggerConfig = {
    yaml: true,
    host,
    name: 'Central UI - API Documentation',
    description: packageJson.description,
    basePath: '/',
    version: packageJson.version,
    outputDirectory: getWritableDirPath(),
    entryFile: path.join(getRootDirPath(), 'src', 'app', 'controllers', '**', '*.ts'),
    ignore: ['**/node_modules/**'],
    securityDefinitions: {
        bearer: {
            name: 'Bearer',
            type: 'apiKey',
            in: 'header'
        },
        oauth2: {
            name: 'User',
            type: 'oauth2',
            in: 'header',
            flow: 'password',
            tokenUrl: env.apiUrl+'token'
        },
        basicAuth: {
            name: 'basic',
            type: 'basic',
            in: 'header'
        }
    },
    decoratorConfig: {
        useBuildIn: true,
        useLibrary: [
            "@decorators/express"
        ]
    },
    consumes: ['application/json'],
    produces: ['application/json']
}

export async function generateSwaggerDocumentation() : Promise<string> {
    return await generateDocumentation(swaggerConfig, tsConfig);
}
