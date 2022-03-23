/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HTTPClient,
    SecretType,
    Train,
    TrainConfig,
    TrainConfigSourceType,
    getHostNameFromString,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { mergeStationsWithTrainStations } from '../../routing/helpers/merge';

type TrainConfigBuildContext = {
    entity: Train,
    hostname: string
};

/**
 * Build train config for a specific train.
 *
 * train.master_image (required)
 *
 *
 * @param context
 */
export async function buildTrainConfig(context: TrainConfigBuildContext) : Promise<TrainConfig> {
    const { entity, hostname } = context;

    const config : TrainConfig = {
        id: entity.id,
        '@id': entity.id,
        '@context': null,
        creator: {
            id: entity.user_id,
            rsa_public_key: null,
            paillier_public_key: null,
        },
        source: {
            type: TrainConfigSourceType.DOCKER,
            // path.posix.join(getHostNameFromString(hostname), entity.master_image.virtual_path)
            address: getHostNameFromString(hostname),
            tag: 'latest',
        },
        proposal_id: entity.proposal_id,
        session_id: entity.session_id,
        file_list: [],
        immutable_file_hash: entity.hash,
        immutable_file_signature: entity.hash_signed,
        route: [],
    };

    const client = useClient<HTTPClient>();

    const response = await client.trainFile.getMany(entity.id);
    config.file_list = response.data.map((file) => `${file.directory}/${file.name}`);

    // ----------------------------------------------------------

    const userSecretIds : string[] = [];
    if (entity.user_rsa_secret_id) {
        userSecretIds.push(entity.user_rsa_secret_id);
    }

    if (entity.user_paillier_secret_id) {
        userSecretIds.push(entity.user_paillier_secret_id);
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

    const { data: trainStations } = await client.trainStation.getMany({
        filter: {
            train_id: entity.id,
        },
        sort: {
            index: 'ASC',
        },
    });

    const { data: stations } = await client.station.getMany({
        filter: {
            id: trainStations.map((trainStation) => trainStation.station_id),
        },
        fields: ['+public_key'],
    });

    const stationsExtended = mergeStationsWithTrainStations(stations, trainStations);

    for (let i = 0; i < stationsExtended.length; i++) {
        config.route.push({
            station: stationsExtended[i].external_id,
            rsa_public_key: stationsExtended[i].public_key,
            eco_system: stationsExtended[i].ecosystem,
            index: stationsExtended[i].index,
            encrypted_key: null,
            signature: null,
        });
    }

    return config;
}
