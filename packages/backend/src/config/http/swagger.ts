/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    MetadataConfig,
    Specification,
    SwaggerDocFormatData,
    SwaggerDocFormatType,

    createMetadataGenerator,
    createSpecGenerator,
} from '@trapi/swagger';
import path from 'path';
import { getRootDirPath, getWritableDirPath } from '../paths';
import env from '../../env';

// tslint:disable-next-line:no-var-requires
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../../../package.json');
// tslint:disable-next-line:no-var-requires
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsConfig = require('../../../tsconfig.json');

const metadataConfig : MetadataConfig = {
    entryFile: path.join(getRootDirPath(), 'src', 'app', 'controllers', '**', '*.ts'),
    ignore: ['**/node_modules/**'],
    decorator: {
        internal: true,
        library: [
            'decorators-express',
        ],
    },
};

export const swaggerConfig : Specification.Config = {
    yaml: true,
    host: env.apiUrl,
    name: 'Central UI - API Documentation',
    description: packageJson.description,
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

export async function generateSwaggerDocumentation() : Promise<Record<SwaggerDocFormatType, SwaggerDocFormatData>> {
    const metadataGenerator = createMetadataGenerator(metadataConfig, tsConfig);

    const metadata = metadataGenerator.generate();

    const specGenerator = createSpecGenerator(metadata, swaggerConfig);

    specGenerator.build();
    return specGenerator.save();
}
