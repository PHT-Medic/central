/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {APIType, useAPI} from "../../../../modules";
import {Service} from "../../entity";
import {Client} from "../../../auth";

export async function saveServiceSecretToVault(
    service: Pick<Service, 'id'> | string,
    client: Pick<Client, 'id' | 'secret'>
) : Promise<Record<string, any>> {
    const id : string = typeof service === 'string' ? service : service.id;

    try {
        const {data} = await useAPI(APIType.VAULT)
            .post('services/' + id, {
                clientId: client.id,
                clientSecret: client.secret
            });

        return data;
    } catch (e) {
        if(e?.response?.status === 404) {
            // create engine
            await useAPI<APIType.VAULT>().createKeyValueEngine({path: 'services'});

            return await saveServiceSecretToVault(service, client);
        }

        throw e;
    }
}

export async function removeServiceSecretFromVault(entity: Pick<Service, 'id'> | string) {
    const id : string = typeof entity === 'string' ? entity : entity.id;

    await useAPI(APIType.VAULT)
        .delete('services/'+id);
}
