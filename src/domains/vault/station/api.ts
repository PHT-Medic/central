import {Station} from "../../pht/station";
import {useVaultApi} from "../../../modules/api/provider/vault";

export type VaultStationPublicKey = {
    path: string,
    content: string
}

export async function findVaultStationPublicKey(stationId: number | string) : Promise<VaultStationPublicKey|undefined> {
    try {
        const { data } = await useVaultApi()
            .get('station_pks/' + stationId);

        return {
            path: 'station_pks/' + stationId,
            content: data.data.data.rsa_station_public_key
        }
    } catch (e) {
        if(e.response.status === 404) {
            return undefined;
        }

        throw e;
    }
}

export async function saveStationPublicKeyToVault(entity: Station) {
    if (!entity.public_key) return;

    await useVaultApi()
        .post('station_pks/' + entity.id, {
            data: {
                rsa_station_public_key: entity.public_key
            },
            options: {
                "cas": 1
            }
        });
}

export async function removeStationPublicKeyFromVault(entity: Station) {
    await useVaultApi()
        .delete('station_pks/' + entity.id);
}
