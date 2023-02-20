/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { HTTPClient } from '../http';

export function useDomainAPI(client: HTTPClient, name: string) {
    switch (name) {
        case 'architecture':
            return client.architecture;
        case 'masterImage':
            return client.masterImage;
        case 'masterImageGroup':
            return client.masterImageGroup;
        case 'proposal':
            return client.proposal;
        case 'proposalStation':
            return client.proposalStation;
        case 'registry':
            return client.registry;
        case 'registryProject':
            return client.registryProject;
        case 'station':
            return client.station;
        case 'train':
            return client.train;
        case 'trainFile':
            return client.trainFile;
        case 'trainStation':
            return client.trainStation;
        case 'service':
            return client.service;
        case 'userSecret':
            return client.userSecret;
    }

    return undefined;
}
