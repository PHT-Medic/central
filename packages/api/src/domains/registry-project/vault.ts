/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from '@hapic/harbor';
import {
    hasClient,
    useClient,
} from '@hapic/vault';
import type { RegistryProjectVaultPayload } from './type';
import { isRegistryProjectVaultPayload } from './utils';

export async function creteRegistryProjectVaultEngine() {
    if (!hasClient()) {
        return;
    }

    const client = useClient();

    await client.mount.create(
        'registry-project',
        {
            type: 'kv',
            options: {
                version: 1,
            },
        },
    );
}

export async function removeRegistryProjectFromVault(name: string) {
    if (!hasClient()) {
        return;
    }

    const client = useClient();

    try {
        await client.keyValueV1.delete(
            'registry-project',
            name,
        );
    } catch (e) {
        if (isClientErrorWithStatusCode(e, 404)) {
            return;
        }

        throw e;
    }
}

export async function saveRegistryProjectToVault(name: string, data: RegistryProjectVaultPayload) {
    try {
        await useClient()
            .keyValueV1.create(
                'registry-project',
                name,
                data,
            );
    } catch (e) {
        if (isClientErrorWithStatusCode(e, 404)) {
            await creteRegistryProjectVaultEngine();
            await saveRegistryProjectToVault(name, data);
        }
    }
}

export async function findRegistryProjectInVault(
    name: string,
) : Promise<RegistryProjectVaultPayload | undefined> {
    if (!hasClient()) {
        return undefined;
    }

    const client = useClient();

    try {
        const response = await client.keyValueV1.getOne(
            'registry-project',
            name,
        );

        if (
            response &&
            response.data &&
            isRegistryProjectVaultPayload(response.data)
        ) {
            return response.data;
        }

        return undefined;
    } catch (e) {
        if (isClientErrorWithStatusCode(e, 404)) {
            return undefined;
        }

        throw e;
    }
}
