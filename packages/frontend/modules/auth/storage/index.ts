/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import BaseStorage from '~/modules/storage';
import { StorageOptionsInterface } from '~/modules/storage/types';

export class AuthStorage extends BaseStorage {
    constructor(ctx: Context, options?: StorageOptionsInterface) {
        options = options ?? {};

        const defaultOptions : StorageOptionsInterface = {
            cookie: {
                path: '/',
            },
            localStorage: false,
            sessionStorage: false,
            namespace: 'auth',
        };

        options = { ...defaultOptions, ...options };

        super(ctx, options);
    }
}

export default AuthStorage;
