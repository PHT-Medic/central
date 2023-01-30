/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';

import { Adapter } from 'browser-storage-adapter';

export default (ctx : Context, inject : Inject) => {
    const setServerCookie = (value: string) => {
        if (ctx.res.headersSent) {
            return;
        }

        let cookies = ctx.res.getHeader('Set-Cookie') || [];
        if (typeof cookies === 'number' || typeof cookies === 'string') {
            if (typeof cookies === 'number') {
                cookies = cookies.toString();
            }
            cookies = [cookies];
        }

        cookies.unshift(value);

        ctx.res.setHeader(
            'Set-Cookie',
            cookies.filter((v, i, arr) => arr.findIndex((val) => val.startsWith(v.substring(0, v.indexOf('=')))) === i),
        );
    };

    const getServerCookies = () => ctx.req.headers.cookie;

    const appWarehouse = new Adapter({
        driver: {
            cookie: {
                path: '/',
                ...(process.env.API_URL === 'production' ? {
                    domain: new URL(process.env.API_URL).hostname,
                } : {}),
            },
        },
        namespace: 'app',
        isServer: () => process.server,
        setServerCookie,
        getServerCookies,
    });
    inject('warehouse', appWarehouse);

    //--------------------------------------------------------------------

    const authWarehouse = new Adapter({
        driver: {
            cookie: {
                path: '/',
                ...(process.env.API_URL === 'production' ? {
                    domain: new URL(process.env.API_URL).hostname,
                } : {}),
            },
        },
        namespace: 'auth',
        isServer: () => process.server,
        setServerCookie,
        getServerCookies,
    });
    inject('authWarehouse', authWarehouse);
};
