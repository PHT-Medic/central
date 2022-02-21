/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';

import { BrowserStorageAdapter } from 'browser-storage-adapter';

import { NavigationProvider } from '../config/layout/module';

export default (ctx : Context, inject : Inject) => {
    const setServerCookie = (value: string) => {
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
            cookies.filter((v, i, arr) => arr.findIndex((val) => val.startsWith(v.substr(0, v.indexOf('=')))) === i),
        );
    };

    const getServerCookies = () => ctx.req.headers.cookie;

    const appWarehouse = new BrowserStorageAdapter({
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

    const authWarehouse = new BrowserStorageAdapter({
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

    //--------------------------------------------------------------------

    const navigationProvider = new NavigationProvider(ctx);
    inject('layoutNavigationProvider', navigationProvider);
};
