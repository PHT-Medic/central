/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HTTPClient } from '@personalhealthtrain/ui-common';
import { HTTPClient as AuthHTTPClient } from '@typescript-auth/domains';
import AuthModule from '../config/auth';
import {SocketModule} from "../config/socket";
import {NavigationProvider} from "../config/layout/module";
import {BrowserStorageAdapter} from "browser-storage-adapter";

declare module 'vuex/types/index' {
    interface Store<S> {
        $warehouse: BrowserStorageAdapter,
        $authWarehouse: BrowserStorageAdapter,

        $api: HTTPClient,
        $authApi: AuthHTTPClient,

        $auth: AuthModule,

        $socket: SocketModule,

        $layoutNavigationProvider: NavigationProvider
    }
}
