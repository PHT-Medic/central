import {Service} from "../../service";
import {useVaultApi} from "../../../modules/api/service/vault";
import {AuthClient} from "../../client";

export async function saveServiceSecretToVault(service: Pick<Service, 'id'> | string, client: Pick<AuthClient, 'id' | 'secret'>) {
    const id : string = typeof service === 'string' ? service : service.id;
    await useVaultApi()
        .post('services/'+id, {
            clientId: client.id,
            clientSecret: client.secret
        });
}

export async function removeServiceSecretFromVault(entity: Pick<Service, 'id'> | string) {
    const id : string = typeof entity === 'string' ? entity : entity.id;

    await useVaultApi()
        .delete('services/'+id);
}
