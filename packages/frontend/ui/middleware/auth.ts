/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import { buildAbilityMetaFromName } from '@authelion/common';
import AuthModule from '../config/auth';
import { LayoutKey } from '../config/layout';

function checkAbilityOrPermission({ route, $auth } : Context) {
    const layoutKeys : string[] = [
        LayoutKey.REQUIRED_ABILITIES,
        LayoutKey.REQUIRED_PERMISSIONS,
    ];

    let isAllowed : undefined | boolean;

    for (let i = 0; i < layoutKeys.length; i++) {
        const layoutKey = layoutKeys[i];

        for (let j = 0; j < route.meta.length; j++) {
            const matchedRecordMeta = route.meta[j];

            if (!Object.prototype.hasOwnProperty.call(matchedRecordMeta, layoutKey)) {
                continue;
            }

            const value = matchedRecordMeta[layoutKey];
            if (Array.isArray(value)) {
                isAllowed = value.some((val) => {
                    if (layoutKey === LayoutKey.REQUIRED_PERMISSIONS) {
                        val = buildAbilityMetaFromName(val);
                    }

                    return $auth.can(val.action, val.subject);
                });
            }

            if (typeof value === 'function') {
                isAllowed = !!value($auth);
            }

            if (isAllowed) {
                return true;
            }
        }
    }

    if (typeof isAllowed === 'undefined') {
        return true;
    }

    if (!isAllowed) {
        const parts = route.path.split('/');
        parts.pop();
        throw new Error(parts.join('/'));
    }

    return true;
}

export default async function middleware({
    route, from, redirect, $auth, store,
} : Context) : Promise<void> {
    let redirectPath = '/';

    if (typeof from !== 'undefined') {
        redirectPath = from.fullPath;
    }

    if (
        !route.path.startsWith('/logout') &&
        !route.fullPath.startsWith('/logout')
    ) {
        try {
            await (<AuthModule> $auth).resolveMe();
        } catch (e) {
            if (store.getters['auth/loggedIn']) {
                await redirect({
                    path: '/logout',
                    query: { redirect: route.fullPath },
                });
            } else {
                await redirect({
                    path: '/login',
                    query: { redirect: route.fullPath },
                });
            }

            return;
        }
    }

    if (
        Array.isArray(route.meta) &&
        route.meta.some((meta) => !!meta[LayoutKey.REQUIRED_LOGGED_IN])
    ) {
        if (!store.getters['auth/loggedIn']) {
            await store.dispatch('auth/triggerLogout');

            const query : Record<string, any> = {};

            if (!route.fullPath.includes('logout')) {
                query.redirect = route.fullPath;
            }

            await redirect({
                path: '/login',
                query,
            });

            return;
        }

        try {
            checkAbilityOrPermission({ route, $auth } as Context);
        } catch (e) {
            await redirect({
                path: redirectPath,
            });

            return;
        }
    }

    if (
        Array.isArray(route.meta) &&
        route.meta.some((meta) => meta[LayoutKey.REQUIRED_LOGGED_OUT])
    ) {
        if (store.getters['auth/loggedIn']) {
            await redirect({ path: redirectPath });
        }
    }
}
