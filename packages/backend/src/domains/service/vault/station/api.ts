import {useVaultApi} from "../../../../modules/api/service/vault";

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

export async function saveStationPublicKeyToVault(id: string, publicKey?: string) {
    if (!publicKey || !id) return;

    await useVaultApi()
        .post('station_pks/' + id, {
            data: {
                rsa_station_public_key: publicKey
            },
            options: {
                "cas": 1
            }
        });
}

export async function deleteStationPublicKeyFromVault(id: string) {
    await useVaultApi()
        .delete('station_pks/' + id);
}
