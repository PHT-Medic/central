/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {useVaultApi} from "../../../../modules/api/service";

export type VaultStationPublicKey = {
    path: string,
    content: string
}

export async function findStationVaultPublicKey(stationId: number | string) : Promise<VaultStationPublicKey|undefined> {
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

export async function saveStationVaultPublicKey(id: string, publicKey?: string) {
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

export async function deleteStationVaultPublicKey(id: string) : Promise<void> {
    try {
        await useVaultApi()
            .delete('station_pks/' + id);
    } catch (e) {
        if(e.response.status === 404) {
            return;
        }

        throw e;
    }
}
