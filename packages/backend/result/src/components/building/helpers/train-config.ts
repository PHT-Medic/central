/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HTTPClient, SecretType, TrainBuilderStartPayload, TrainConfig, TrainConfigSourceType,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';

export async function buildTrainConfig(data: TrainBuilderStartPayload) : Promise<TrainConfig> {
    const config : TrainConfig = {
        id: data.id,
        creator: {
            id: data.user_id,
            rsa_public_key: null,
            paillier_public_key: null,
        },
        source: {
            type: TrainConfigSourceType.DOCKER,
            address: data.master_image,
            tag: 'latest',
        },
        proposal_id: data.proposal_id,
        session_id: data.session_id,
        file_list: data.files,
        immutable_file_hash: data.hash,
        immutable_file_signature: data.hash_signed,
        route: [],
    };

    const client = useClient<HTTPClient>();

    // ----------------------------------------------------------

    const userSecretIds : string[] = [];
    if (data.user_rsa_secret_id) {
        userSecretIds.push(data.user_rsa_secret_id);
    }

    if (data.user_paillier_secret_id) {
        userSecretIds.push(data.user_paillier_secret_id);
    }

    const userSecrets = await client.userSecret.getMany({
        filter: {
            id: userSecretIds,
        },
    });

    for (let i = 0; i < userSecrets.data.length; i++) {
        if (userSecrets.data[i].type === SecretType.RSA_PUBLIC_KEY) {
            config.creator.rsa_public_key = userSecrets.data[i].content;
        }

        if (userSecrets.data[i].type === SecretType.PAILLIER_PUBLIC_KEY) {
            config.creator.paillier_public_key = userSecrets.data[i].content;
        }
    }

    // ----------------------------------------------------------

    const stations = await client.station.getMany({
        filter: {
            secure_id: data.stations.map((station) => station.id),
        },
        fields: ['+secure_id', '+public_key'],
    });

    for (let i = 0; i < stations.data.length; i++) {
        const trainConfigIndex = data.stations.findIndex((station) => station.id === stations.data[i].secure_id);

        config.route.push({
            station: stations.data[i].secure_id,
            rsa_public_key: stations.data[i].public_key,
            eco_system: stations.data[i].ecosystem,
            index: trainConfigIndex >= 0 ? data.stations[trainConfigIndex].index : null,
            encrypted_key: null,
            signature: null,
        });
    }

    return config;
}
