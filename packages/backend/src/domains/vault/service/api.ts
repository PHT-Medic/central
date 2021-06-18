import {Service} from "../../service";
import {useVaultApi} from "../../../modules/api/service/vault";

export async function saveServiceSecretToVault(entity: Service) {
   await useVaultApi()
       .post('services/'+entity.id, {
            clientId: entity.client.id,
            clientSecret: entity.client.secret
       });
}

export async function removeServiceSecretFromVault(entity: Service | string) {
    const id : string = typeof entity === 'string' ? entity : entity.id;

    await useVaultApi()
        .delete('services/'+id);
}
