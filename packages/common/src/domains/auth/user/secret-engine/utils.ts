/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { USER_SECRET_ENGINE_KEY } from './constants';
import { SecretType, UserSecret } from '../../user-secret';
import { UserSecretEngineSecretPayload } from './type';

export function isSecretStorageUserKey(name: string): boolean {
    return name.startsWith(`${USER_SECRET_ENGINE_KEY}/`);
}

export function getSecretStorageUserKey(name: string): string {
    return name.replace(`${USER_SECRET_ENGINE_KEY}/`, '');
}

export function buildSecretStorageUserKey(id: string | number): string {
    return `${USER_SECRET_ENGINE_KEY}/${id}`;
}

// -----------------------------------------------------------

export function buildSecretStorageUserPayload(context: {
    [SecretType.RSA_PUBLIC_KEY]: string,
    [SecretType.PAILLIER_PUBLIC_KEY]: string
} | UserSecret[]) : UserSecretEngineSecretPayload {
    if (Array.isArray(context)) {
        const items = [...context];

        context = {
            [SecretType.RSA_PUBLIC_KEY]: null,
            [SecretType.PAILLIER_PUBLIC_KEY]: null,
        };

        for (let i = 0; i < items.length; i++) {
            context[items[i].type] = items[i].content;
        }
    }
    return {
        data: {
            rsa_public_key: context[SecretType.RSA_PUBLIC_KEY],
            paillier_public_key: context[SecretType.PAILLIER_PUBLIC_KEY],
        },
        options: {
            cas: 0,
        },
    };
}
