/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { APIClient } from '@personalhealthtrain/central-common';
import { APIClient as AuthupAPIClient} from '@authup/core';
import AuthModule from '../config/auth';
import {SocketModule} from '../config/socket';
import {Adapter} from 'browser-storage-adapter';

declare module 'vuex/types/index' {
    interface Store<S> {
        $warehouse: Adapter,

        $api: APIClient,
        $authupApi: AuthupAPIClient,

        $auth: AuthModule,

        $socket: SocketModule
    }
}
