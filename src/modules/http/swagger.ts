import {generateDocumentation, SwaggerConfig} from "typescript-swagger";
import {getRootDirPath, getWritableDirPath} from "../../config/paths";
import path from "path";
import env from "../../env";

const packageJson = require('../../../package.json');
const tsConfig = require('../../../tsconfig.json');
const url = new URL(env.apiUrl);

export const swaggerConfig : SwaggerConfig = {
    yaml: true,
    host: url.host,
    name: 'Central UI - API Documentation',
    description: packageJson.description,
    basePath: '/',
    version: packageJson.version,
    outputDirectory: getWritableDirPath(),
    entryFile: path.join(getRootDirPath(), 'src', 'app', 'controllers', '**', '*.ts'),
    ignore: ['**/node_modules/**'],
    securityDefinitions: {
        bearerHeader: {
            name: 'Bearer',
            type: 'apiKey',
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
