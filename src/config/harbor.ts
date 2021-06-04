export const HARBOR_INCOMING_PROJECT_NAME = 'pht_incoming';
export const HARBOR_OUTGOING_PROJECT_NAME = 'pht_outgoing';

export const HARBOR_MASTER_IMAGE_PROJECT_NAME = 'pht_master';
export const HARBOR_MASTER_IMAGE_REPOSITORY_NAME = 'master';

export const HARBOR_STATION_PROJECT_PREFIX = 'station_';

export function createHarborStationProjectName(stationId: string) {
    return HARBOR_STATION_PROJECT_PREFIX + stationId;
}

export function isHarborStationProjectName(projectName: string) {
    return projectName.startsWith('station_');
}
