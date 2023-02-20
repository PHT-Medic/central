/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Context } from '@nuxt/types';
import type { Inject } from '@nuxt/types/app';

import { AuthModule } from '../config/auth';

export default (ctx: Context, inject: Inject) => {
    const auth = new AuthModule(ctx, {
        token_endpoint: new URL('token', ctx.$config.apiUrl).href,
        introspection_endpoint: new URL('token/introspect', ctx.$config.apiUrl).href,
        userinfo_endpoint: new URL('users/@me', ctx.$config.apiUrl).href,
    });

    inject('auth', auth);
};
