/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    MetadataConfig,
    Specification,
    SwaggerDocFormatData,
    SwaggerDocFormatType,
    generateDocumentation,
} from '@trapi/swagger';
import path from 'path';
import { getSwaggerEntrypoint } from '@authup/server-http';
import { getRootDirPath, getWritableDirPath } from '../config';
import env from '../env';

export async function generateSwaggerDocumentation() : Promise<Record<SwaggerDocFormatType, SwaggerDocFormatData>> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require
    const packageJson = require(path.join(getRootDirPath(), 'package.json'));
    // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require,import/no-dynamic-require
    const tsConfig = require(path.join(getRootDirPath(), 'tsconfig.json'));

    const metadataConfig : MetadataConfig = {
        entryPoint: [
            { pattern: '**/*.ts', cwd: path.join(getRootDirPath(), 'src', 'http', 'controllers') },
            getSwaggerEntrypoint(),
        ],
        ignore: ['**/node_modules/**'],
        allow: ['**/@authup/**'],
        decorator: {
            internal: true,
            preset: [
                'routup',
            ],
        },
    };

    const swaggerConfig : Specification.Config = {
        yaml: true,
        host: env.apiUrl,
        name: 'API Documentation',
        description: 'Explore the REST Endpoints of the Central API.',
        basePath: '/',
        version: packageJson.version,
        outputDirectory: getWritableDirPath(),
        securityDefinitions: {
            bearer: {
                name: 'Bearer',
                type: 'apiKey',
                in: 'header',
            },
            oauth2: {
                type: 'oauth2',
                flows: {
                    password: {
                        tokenUrl: `${env.apiUrl}token`,
                    },
                },
            },
            basicAuth: {
                type: 'http',
                schema: 'basic',
            },
        },
        consumes: ['application/json'],
        produces: ['application/json'],
    };

    return generateDocumentation({
        metadata: metadataConfig,
        swagger: swaggerConfig,
    }, tsConfig);
}
