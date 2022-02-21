/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function isRegistryStationProjectName(name: string): boolean {
    return name.startsWith('station_');
}

export function getRegistryStationProjectNameId(name: string): string {
    return name.replace('station_', '');
}

export function buildRegistryStationProjectName(id: string | number): string {
    return `station_${id}`;
}
