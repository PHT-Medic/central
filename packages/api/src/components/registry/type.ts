/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry, RegistryProject } from '@personalhealthtrain/central-common';
import type { RegistryCommand } from './constants';

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

export type RegistrySetupPayload = {
    id: Registry['id']
};

export type RegistryCleanupPayload = {
    id: Registry['id']
};

export type RegistryProjectLinkPayload = {
    id: RegistryProject['id']
};

export type RegistryProjectUnlinkPayload = {
    id?: RegistryProject['id'],
    registryId: Registry['id'],
    externalName: RegistryProject['external_name'],
    accountId?: RegistryProject['account_id']
};

export type RegistryProjectRelinkPayload = RegistryProjectUnlinkPayload & {
    id: RegistryProject['id']
};

export type RegistryEventPayload = {
    event: string,
    operator: string,
    namespace: string,
    repositoryName: string,
    repositoryFullName: string,
    artifactTag?: string,
    artifactDigest?: string,
};

export type RegistrySetupCommandContext = {
    command: `${RegistryCommand.SETUP}`,
    data: RegistrySetupPayload
};

export type RegistryEventCommandContext = {
    command: `${RegistryCommand.EVENT_HANDLE}`,
    data: RegistryEventPayload
};

export type RegistryDeleteCommandContext = {
    command: `${RegistryCommand.DELETE}`,
    data: RegistrySetupPayload
};

export type RegistryCleanupCommandContext = {
    command: `${RegistryCommand.CLEANUP}`,
    data: RegistryCleanupPayload
};

export type RegistryProjectLinkCommandContext = {
    command: `${RegistryCommand.PROJECT_LINK}`,
    data: RegistryProjectLinkPayload
};

export type RegistryProjectUnlinkCommandContext = {
    command: `${RegistryCommand.PROJECT_UNLINK}`,
    data: RegistryProjectUnlinkPayload
};

export type RegistryProjectRelinkCommandContext = {
    command: `${RegistryCommand.PROJECT_RELINK}`,
    data: RegistryProjectRelinkPayload
};

export type RegistryCommandContext = RegistryEventCommandContext |
RegistrySetupCommandContext |
RegistryDeleteCommandContext |
RegistryCleanupCommandContext |
RegistryProjectLinkCommandContext |
RegistryProjectUnlinkCommandContext |
RegistryProjectRelinkCommandContext;
