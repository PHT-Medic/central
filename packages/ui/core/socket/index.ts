/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    SocketClientToServerEvents,
    SocketServerToClientEvents,
} from '@personalhealthtrain/central-common';
import {
    buildSocketRealmNamespaceName,
} from '@personalhealthtrain/central-common';
import type { Pinia } from 'pinia';
import type { ManagerOptions, Socket } from 'socket.io-client';
import { Manager } from 'socket.io-client';
import { useNuxtApp } from '#app';
import { AuthBrowserStorageKey } from '../../config/auth';
import { useAuthStore } from '../../store/auth';

type SocketModuleManagerConfiguration = {
    url: string,
    options?: Partial<ManagerOptions>
};

type SocketInterface = Socket<SocketServerToClientEvents, SocketClientToServerEvents>;

export class SocketModule {
    protected manager : Manager;

    protected sockets : Record<string, SocketInterface>;

    //--------------------------------------------------------------------

    constructor(managerConfiguration : SocketModuleManagerConfiguration) {
        this.sockets = {};

        this.manager = new Manager(managerConfiguration.url, {
            autoConnect: false,
            ...managerConfiguration.options,
        });

        this.subscribeStore();
    }

    private subscribeStore() {
        const nuxtApp = useNuxtApp();
        const store = useAuthStore(nuxtApp.$pinia as Pinia);

        store.$subscribe((mutation, state) => {
            // todo: find out if reconnect is required.
            const keys = Object.keys(this.sockets);
            for (let i = 0; i < keys.length; i++) {
                this.reconnect(keys[i]);
            }
        });
    }

    //--------------------------------------------------------------------

    public useRealmWorkspace(realmId?: string | null) {
        const nuxtApp = useNuxtApp();
        const store = useAuthStore(nuxtApp.$pinia as Pinia);

        if (!realmId) {
            realmId = store.realmId;
        }

        if (!realmId) {
            const user = nuxtApp.$warehouse.get(AuthBrowserStorageKey.USER);
            if (user.realm_id) {
                realmId = user.realm_id;
            }
        }

        if (!realmId) {
            return this.use();
        }

        return this.use(buildSocketRealmNamespaceName(realmId));
    }

    public use(namespace = '/') : SocketInterface {
        if (typeof this.manager === 'undefined') {
            throw new Error('Manager not initialized...');
        }
        if (this.sockets[namespace]) {
            return this.sockets[namespace];
        }

        const getToken = (cb: CallableFunction) => {
            const nuxtApp = useNuxtApp();

            let token : string | undefined = nuxtApp.$warehouse.get(AuthBrowserStorageKey.ACCESS_TOKEN);
            if (typeof token === 'undefined') {
                const store = useAuthStore(nuxtApp.$pinia as Pinia);
                token = store.accessToken;
            }

            if (typeof token !== 'undefined') {
                return cb({ token });
            }

            return cb();
        };

        getToken.bind(this);

        const socket = this.manager.socket(namespace, {
            auth: getToken,
        });

        if (!process.server) {
            socket.connect();
        }

        this.sockets[namespace] = socket;

        return socket;
    }

    public unUse(namespace = '/') {
        if (this.sockets[namespace]) {
            this.sockets[namespace].disconnect();
            delete this.sockets[namespace];
        }
    }

    //--------------------------------------------------------------------

    public reconnect(namespace: string) {
        if (!this.sockets[namespace]) return;

        const socket = this.sockets[namespace];
        socket.disconnect();

        setTimeout(() => {
            socket.connect();

            this.sockets[namespace] = socket;
        }, 0);
    }
}
