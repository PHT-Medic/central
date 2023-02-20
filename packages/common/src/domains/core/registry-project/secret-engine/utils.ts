/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { REGISTRY_PROJECT_SECRET_ENGINE_KEY } from './constants';
import type { RegistryProjectSecretStoragePayload } from './type';
import type { RegistryProject } from '../entity';

export function isRegistryProjectSecretStorageKey(name: string): boolean {
    return name.startsWith(`${REGISTRY_PROJECT_SECRET_ENGINE_KEY}/`);
}

export function getRegistryProjectSecretStorageKey(name: string): string {
    return name.replace(`${REGISTRY_PROJECT_SECRET_ENGINE_KEY}/`, '');
}

export function buildRegistryProjectSecretStorageKey(id: string | number): string {
    return `${REGISTRY_PROJECT_SECRET_ENGINE_KEY}/${id}`;
}

// -----------------------------------------------------------

export function buildRegistryProjectSecretStoragePayload(entity: Partial<RegistryProject>) : RegistryProjectSecretStoragePayload {
    return {
        ...(entity.account_id ? { account_id: entity.account_id } : {}),
        ...(entity.account_name ? { account_name: entity.account_name } : {}),
        ...(entity.account_secret ? { account_secret: entity.account_secret } : {}),
    };
}

export function buildRegistryProjectFromSecretStoragePayload(payload: RegistryProjectSecretStoragePayload) : Partial<RegistryProject> {
    return {
        account_id: payload.account_id,
        account_name: payload.account_name,
        account_secret: payload.account_secret,
    };
}
