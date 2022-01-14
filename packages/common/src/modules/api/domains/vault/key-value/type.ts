/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AxiosInstance } from 'axios';
import { VaultMountAPI } from '../mount';

export type VaultKeyValueContext = {
    client: AxiosInstance,
    mountAPI: VaultMountAPI
};

export enum VaultKVVersion {
    ONE = 1,
    TWO = 2,
}

export type VaultKVOptions = {
    version?: VaultKVVersion
};
