/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

const stationKey : string = 'station_pks/';
const userKey : string = 'user_pks/';

// ------------------------------------------------------------

export function isSecretStorageStationKey(name: string) : boolean {
    return name.startsWith(stationKey);
}

export function getSecretStorageStationKey(name: string) : string {
    return name.replace(stationKey, '');
}

export function buildSecretStorageStationKey(id: string | number) : string {
    return stationKey + id;
}

// ------------------------------------------------------------

export function isSecretStorageUserKey(name: string) : boolean {
    return name.startsWith(userKey);
}

export function getSecretStorageUserKey(name: string) : string {
    return name.replace(userKey, '');
}

export function buildSecretStorageUserKey(id: string | number) : string {
    return userKey + id;
}
