/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PluginBaseOptions } from '@vue-layout/list-controls/core';
import type { APIClient } from '@personalhealthtrain/central-common';
import type { AuthupAPIClient, AuthupStore, SocketManager } from './core';

export type Options = PluginBaseOptions & {
    apiClient?: APIClient,
    authupStore?: AuthupStore,
    authupApiClient?: AuthupAPIClient,
    socketManager?: SocketManager,
    components?: boolean | string[],
};
