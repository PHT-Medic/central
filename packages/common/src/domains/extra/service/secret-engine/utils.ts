/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SERVICE_SECRET_ENGINE_KEY } from './constants';
import { ServiceSecretEngineSecretPayload } from './type';

export function isSecretStorageServiceKey(name: string): boolean {
    return name.startsWith(`${SERVICE_SECRET_ENGINE_KEY}/`);
}

export function getSecretStorageServiceKey(name: string): string {
    return name.replace(`${SERVICE_SECRET_ENGINE_KEY}/`, '');
}

export function buildSecretStorageServiceKey(id: string | number): string {
    return `${SERVICE_SECRET_ENGINE_KEY}/${id}`;
}

// -----------------------------------------------------------

export function buildSecretStorageServicePayload(
    clientId: string,
    clientSecret: string,
) : ServiceSecretEngineSecretPayload {
    return {
        clientId,
        clientSecret,
    };
}
