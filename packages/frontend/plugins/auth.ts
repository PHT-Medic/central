/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';

import AuthModule from '../config/auth';

export default (context: Context, inject: Inject) => {
    const auth = new AuthModule(context, {
        tokenHost: context.$config.apiUrl,
        tokenPath: 'token',
        userInfoPath: 'token',
    });

    inject('auth', auth);
};
