/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { StationRegistryCommand } from './consants';

export type StationRegistryComponentPayload = {
    [key: string]: any
};

export type StationRegistryEntity = {
    id: string,
    name: string,
    realm_id?: string,
    [key: string]: any,
};

export type StationRegistrySyncCommandContext = {
    data: StationRegistryComponentPayload,
    command: `${StationRegistryCommand.SYNC}`
};

export type StationRegistryCommandContext = StationRegistrySyncCommandContext;
