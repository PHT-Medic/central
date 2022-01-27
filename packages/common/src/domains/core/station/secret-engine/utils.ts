/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { STATION_SECRET_ENGINE_KEY } from './constants';
import { StationSecretStoragePayload } from './type';
import { Station } from '../entity';

export function isStationSecretStorageKey(name: string): boolean {
    return name.startsWith(`${STATION_SECRET_ENGINE_KEY}/`);
}

export function getStationSecretStorageKey(name: string): string {
    return name.replace(`${STATION_SECRET_ENGINE_KEY}/`, '');
}

export function buildStationSecretStorageKey(id: string | number): string {
    return `${STATION_SECRET_ENGINE_KEY}/${id}`;
}

// -----------------------------------------------------------

export function buildStationSecretStoragePayload(station: Partial<Station>) : StationSecretStoragePayload {
    return {
        rsa_public_key: station.public_key,
        registry_robot_id: station.registry_project_account_id,
        registry_robot_name: station.registry_project_account_name,
        registry_robot_secret: station.registry_project_account_token,
    };
}

export function buildStationFromSecretStoragePayload(payload: StationSecretStoragePayload) : Partial<Station> {
    return {
        public_key: payload.rsa_public_key,
        registry_project_account_id: payload.registry_robot_id,
        registry_project_account_name: payload.registry_robot_name,
        registry_project_account_token: payload.registry_robot_secret,
    };
}
