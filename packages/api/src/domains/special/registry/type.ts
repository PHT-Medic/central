/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry, RegistryProject } from '@personalhealthtrain/central-common';
import type { RegistryQueueCommand } from './constants';

export type RegistryQueueSetupPayload = {
    id: Registry['id'],
    entity?: Registry
};

export type RegistryProjectLinkQueuePayload = {
    id: RegistryProject['id'],
    entity?: RegistryProject
};

export type RegistryProjectUnlinkQueuePayload = {
    id: RegistryProject['id'],
    registryId: Registry['id'],
    externalName: RegistryProject['external_name'],
    accountId: RegistryProject['account_id'],
    updateDatabase?: boolean
};

export type RegistryEventQueuePayload = {
    operator: string,
    namespace: string,
    repositoryName: string,
    repositoryFullName: string,
    artifactTag?: string,
    artifactDigest?: string,
    [key: string]: string
};

export type RegistryQueuePayload<T extends `${RegistryQueueCommand}`> =
    T extends `${RegistryQueueCommand.SETUP}` | `${RegistryQueueCommand.DELETE}` ?
        RegistryQueueSetupPayload :
        T extends `${RegistryQueueCommand.PROJECT_LINK}` ?
            RegistryProjectLinkQueuePayload :
            T extends `${RegistryQueueCommand.PROJECT_UNLINK}` | `${RegistryQueueCommand.PROJECT_RELINK}` ?
                RegistryProjectUnlinkQueuePayload :
                T extends `${RegistryQueueCommand.EVENT_HANDLE}` ?
                    RegistryEventQueuePayload :
                    never;

// ---------------------------------------------------

type RegistryHookEventData = {
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
    event_data: RegistryHookEventData
};
