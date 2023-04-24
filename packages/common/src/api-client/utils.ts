/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '../domains';
import type { APIClient } from './module';

export function useDomainAPI(
    client: APIClient,
    name: `${DomainType}`,
) {
    switch (name) {
        case DomainType.MASTER_IMAGE:
            return client.masterImage;
        case DomainType.MASTER_IMAGE_GROUP:
            return client.masterImageGroup;
        case DomainType.PROPOSAL:
            return client.proposal;
        case DomainType.PROPOSAL_STATION:
            return client.proposalStation;
        case DomainType.REGISTRY:
            return client.registry;
        case DomainType.REGISTRY_PROJECT:
            return client.registryProject;
        case DomainType.STATION:
            return client.station;
        case DomainType.TRAIN:
            return client.train;
        case DomainType.TRAIN_FILE:
            return client.trainFile;
        case DomainType.TRAIN_STATION:
            return client.trainStation;
        case DomainType.SERVICE:
            return client.service;
        case DomainType.USER_SECRET:
            return client.userSecret;
    }

    return undefined;
}
