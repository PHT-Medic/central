/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HTTPClient } from '@personalhealthtrain/central-common';
import { HTTPClient as AuthHTTPClient } from '@authup/common';
import AuthModule from '../config/auth';
import {SocketModule} from '../config/socket';
import {Adapter} from 'browser-storage-adapter';

declare module 'vuex/types/index' {
    interface Store<S> {
        $warehouse: Adapter,
        $authWarehouse: Adapter,

        $api: HTTPClient,
        $authApi: AuthHTTPClient,

        $auth: AuthModule,

        $socket: SocketModule
    }
}
