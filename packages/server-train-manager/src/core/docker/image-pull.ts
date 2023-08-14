/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useDocker } from './instance';
import { findErrorInDockerModemResponse } from './modem-response';
import type { DockerAuthConfig } from './type';

export async function pullDockerImage(
    image: string,
    authConfig?: DockerAuthConfig,
) {
    const options : Record<string, any> = {};
    if (authConfig) {
        options.authconfig = authConfig;
    }

    const stream = await useDocker().pull(image, options);

    return new Promise<any>(((resolve, reject) => {
        useDocker().modem.followProgress(stream, (error: Error | null, output: any[]) => {
            error = error || findErrorInDockerModemResponse(output);
            if (error) {
                reject(error);
                return;
            }

            resolve(output);
        });
    }));
}
