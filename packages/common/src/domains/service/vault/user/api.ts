
/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {APIType, useAPI} from "../../../../modules";
import {UserKeyRing} from "../../../auth";

export async function saveUserPublicKeyToVault(entity: UserKeyRing) {
    const data : Record<string, any> = {
        rsa_public_key: entity.public_key,
        he_key: entity.he_key
    };

    const options : Record<string, any>  = {
        cas: 0
    };

    await useAPI(APIType.VAULT).post('user_pks/'+entity.user_id, {
        data,
        options
    });
}

export async function removeUserPublicKeyFromVault(entity: UserKeyRing | number) {
    const id : number = typeof entity === 'number' ? entity : entity.user_id;
    await useAPI(APIType.VAULT).delete('user_pks/'+id);
}
