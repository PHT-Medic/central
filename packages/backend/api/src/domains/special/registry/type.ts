/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Station } from '@personalhealthtrain/central-common';
import { RegistryQueueEntityType } from './constants';

export type RegistryStationQueuePayload = {
    type: RegistryQueueEntityType.STATION
} & Partial<Station>;

export type RegistryQueuePayload =
    RegistryStationQueuePayload;

// ---------------------------------------------------

export type RegistryEventQueuePayload = {
    operator: string,
    namespace: string,
    repositoryName: string,
    repositoryFullName: string,
    artifactTag?: string,
    artifactDigest?: string,
    [key: string]: string
};

// ---------------------------------------------------

type RegistryHookEvent = {
    repository: {
        name: string,
        repo_full_name: string,
        date_created: string | undefined,
        namespace: string
    },
    resources: {
        digest: string,
        tag: string,
        resource_url: string
    }[],
    [key: string]: any
};

export type RegistryHook = {
    type: string,
    occur_at?: string,
    operator: string,
    event_data: RegistryHookEvent
};
