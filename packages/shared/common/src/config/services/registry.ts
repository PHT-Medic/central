/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Incoming train project name
 */
export const REGISTRY_INCOMING_PROJECT_NAME = 'incoming';

/**
 * Outgoing train project name
 */
export const REGISTRY_OUTGOING_PROJECT_NAME = 'outgoing';

/**
 * Master Image project name
 */
export const REGISTRY_MASTER_IMAGE_PROJECT_NAME = 'master';

// -----------------------------------

/**
 * TrainRouter- & TrainBuilder harbor user.
 */
export const REGISTRY_SYSTEM_USER_NAME = 'system';

// -----------------------------------

export const REGISTRY_ARTIFACT_TAG_LATEST = 'latest';

export const REGISTRY_ARTIFACT_TAG_BASE = 'base';

// -----------------------------------

export function isSpecialRegistryProjectName(name: string) : boolean {
    return [
        REGISTRY_INCOMING_PROJECT_NAME,
        REGISTRY_OUTGOING_PROJECT_NAME,
        REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    ].indexOf(name) !== -1;
}
