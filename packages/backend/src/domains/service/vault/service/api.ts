import {Service} from "../../index";
import {useVaultApi} from "../../../../modules/api/service/vault";
import {Client} from "../../../auth/client";

export async function saveServiceSecretToVault(
    service: Pick<Service, 'id'> | string,
    client: Pick<Client, 'id' | 'secret'>
) : Promise<Record<string, any>> {
    const id : string = typeof service === 'string' ? service : service.id;

    try {
        const {data} = await useVaultApi()
            .post('services/' + id, {
                clientId: client.id,
                clientSecret: client.secret
            });

        return data;
    } catch (e) {
        if(e?.response?.status === 404) {
            // create engine
            await useVaultApi().createKeyValueEngine({path: 'services'});

            return await saveServiceSecretToVault(service, client);
        }

        throw e;
    }
}

export async function removeServiceSecretFromVault(entity: Pick<Service, 'id'> | string) {
    const id : string = typeof entity === 'string' ? entity : entity.id;

    await useVaultApi()
        .delete('services/'+id);
}
