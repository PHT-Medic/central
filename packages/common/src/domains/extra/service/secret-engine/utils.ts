/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ServiceSecretEngineSecretPayload } from './type';
import { ROBOT_SECRET_ENGINE_KEY } from '../../../auth';

export function isSecretStorageServiceKey(name: string): boolean {
    return name.startsWith(`${ROBOT_SECRET_ENGINE_KEY}/`);
}

export function getSecretStorageServiceKey(name: string): string {
    return name.replace(`${ROBOT_SECRET_ENGINE_KEY}/`, '');
}

export function buildSecretStorageServiceKey(id: string | number): string {
    return `${ROBOT_SECRET_ENGINE_KEY}/${id}`;
}

// -----------------------------------------------------------

export function buildSecretStorageServicePayload(
    id: string,
    secret: string,
) : ServiceSecretEngineSecretPayload {
    return {
        id,
        secret,
    };
}
