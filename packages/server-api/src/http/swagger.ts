/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import {
    Version, generate,
} from '@routup/swagger';
import { load } from 'locter';
import { getRootDirPath, getWritableDirPath, useEnv } from '../config';

export async function generateSwaggerDocumentation() {
    const packageJson = await load(path.join(getRootDirPath(), 'package.json')) as Record<string, any>;

    return generate({
        version: Version.V2,
        options: {
            metadata: {
                cache: false,
                entryPoint: [
                    { pattern: '**/*.ts', cwd: path.join(getRootDirPath(), 'src', 'http', 'controllers') },
                ],
                ignore: ['**/node_modules/**'],
                allow: ['**/@authup/**'],
            },
            yaml: true,
            servers: [useEnv('apiUrl')],
            name: 'API Documentation',
            description: 'Explore the REST Endpoints of the Central API.',
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
                            tokenUrl: new URL('token', useEnv('apiUrl')).href,
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
        },
    });
}
