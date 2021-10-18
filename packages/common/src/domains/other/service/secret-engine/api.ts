/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {APIType, useAPI} from "../../../../modules";
import {Client} from "../../../auth";
import {SERVICE_ID} from "../type";

const SERVICE_ENGINE_PATH = 'services';

export async function saveServiceSecretsToSecretEngine(
    id: SERVICE_ID,
    client: Pick<Client, 'id' | 'secret'>
) : Promise<Record<string, any>> {
    try {
        const {data} = await useAPI<APIType.VAULT>(APIType.VAULT)
            .saveKeyValuePair(SERVICE_ENGINE_PATH, id, {
                clientId: client.id,
                clientSecret: client.secret
            });

        return data;
    } catch (e) {
        if (e?.response?.status === 404) {
            // create engine
            await useAPI<APIType.VAULT>(APIType.VAULT)
                .createKeyValueSecretEngine({path: SERVICE_ENGINE_PATH});

            return await saveServiceSecretsToSecretEngine(id, client);
        }

        throw e;
    }
}

export async function dropServiceSecretFromVault(id: string) {
    await useAPI<APIType.VAULT>(APIType.VAULT)
        .dropKeyValuePair(SERVICE_ENGINE_PATH, id);
}
