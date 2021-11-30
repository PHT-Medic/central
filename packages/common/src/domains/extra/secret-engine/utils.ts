/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { APIType, useAPI } from '../../../modules';

export async function saveToSecretEngine(
    path: string,
    id: string,
    data: Record<string, any>,
) : Promise<Record<string, any>> {
    try {
        const { data: responseData } = await useAPI<APIType.VAULT>(APIType.VAULT)
            .saveKeyValuePair(path, id, data);

        return responseData;
    } catch (e) {
        if (e?.response?.status === 404) {
            // create engine
            await useAPI<APIType.VAULT>(APIType.VAULT)
                .createKeyValueSecretEngine({ path });

            return saveToSecretEngine(path, id, data);
        }

        throw e;
    }
}

export async function deleteFromSecretEngine(path: string, id: string) {
    await useAPI<APIType.VAULT>(APIType.VAULT)
        .dropKeyValuePair(path, id);
}
