/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Incoming train project name
 */
export const HARBOR_INCOMING_PROJECT_NAME = 'pht_incoming';

/**
 * Outgoing train project name
 */
export const HARBOR_OUTGOING_PROJECT_NAME = 'pht_outgoing';

/**
 * Master Image project name
 */
export const HARBOR_MASTER_IMAGE_PROJECT_NAME = 'master';

// -----------------------------------

/**
 * TrainRouter- & TrainBuilder harbor user.
 */
export const HARBOR_SYSTEM_USER_NAME = 'system';

// -----------------------------------

export function isHarborStationProjectName(name: string) : boolean {
    return name.startsWith('station_');
}

export function buildStationHarborProjectName(id: string | number) : string {
    return 'station_' + id;
}
