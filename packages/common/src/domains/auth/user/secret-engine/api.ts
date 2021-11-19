
/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {APIType, useAPI} from "../../../../modules";
import {UserKeyRing} from "../../index";

const USER_ENGINE_PATH = 'user_pks';

export async function saveUserSecretsToSecretEngine(entity: UserKeyRing) {
    try {
        const {data} = await useAPI<APIType.VAULT>(APIType.VAULT)
            .saveKeyValuePair(
                USER_ENGINE_PATH,
                entity.user_id.toString(),
                {
                    data: {
                        rsa_public_key: entity.public_key,
                        he_key: entity.he_key
                    },
                    options: {
                        cas: 0
                    }
                }
            );
        return data;
    } catch (e) {
        if (e?.response?.status === 404) {
            // create engine
            await useAPI<APIType.VAULT>(APIType.VAULT)
                .createKeyValueSecretEngine({
                    path: USER_ENGINE_PATH
                });

            return await saveUserSecretsToSecretEngine(entity);
        }
    }
}

export async function removeUserSecretsFromSecretEngine(userId: number) {
    await useAPI<APIType.VAULT>(APIType.VAULT).dropKeyValuePair(
        USER_ENGINE_PATH,
        userId.toString()
    );
}
