/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum RegistryCommand {
    SETUP = 'setup',

    STATION_SAVE = 'stationSave',
    STATION_DELETE = 'stationDelete',
}

export type RegistryCommandType = `${RegistryCommand}`;
