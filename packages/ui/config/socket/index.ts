/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Context } from '@nuxt/types';
import type {
    SocketClientToServerEvents,
    SocketServerToClientEvents,
} from '@personalhealthtrain/central-common';
import {
    buildSocketRealmNamespaceName,
} from '@personalhealthtrain/central-common';
import type { ManagerOptions, Socket } from 'socket.io-client';
import { Manager } from 'socket.io-client';
import { AuthBrowserStorageKey } from '../auth';

type SocketModuleManagerConfiguration = {
    url: string,
    options?: Partial<ManagerOptions>
};

type SocketInterface = Socket<SocketServerToClientEvents, SocketClientToServerEvents>;

export class SocketModule {
    protected ctx: Context;

    protected manager : Manager;

    protected sockets : Record<string, SocketInterface>;

    //--------------------------------------------------------------------

    constructor(ctx: Context, managerConfiguration : SocketModuleManagerConfiguration) {
        this.ctx = ctx;
        this.sockets = {};

        this.manager = new Manager(managerConfiguration.url, {
            autoConnect: false,
            ...managerConfiguration.options,
        });

        this.subscribeStore();
    }

    private subscribeStore() {
        if (typeof this.ctx === 'undefined') return;

        this.ctx.store.subscribe((mutation: any) => {
            switch (mutation.type) {
                case 'auth/unsetToken':
                case 'auth/setToken': {
                    const keys = Object.keys(this.sockets);
                    for (let i = 0; i < keys.length; i++) {
                        this.reconnect(keys[i]);
                    }
                    break;
                }
            }
        });
    }

    //--------------------------------------------------------------------

    public useRealmWorkspace(realmId?: string) {
        if (!this.ctx) return undefined;

        if (!realmId) {
            realmId = this.ctx.store.getters['auth/realmId'];
        }
        if (!realmId) {
            const user = this.ctx.$authWarehouse.get(AuthBrowserStorageKey.USER);
            if (user.realm_id) {
                realmId = user.realm_id;
            }
        }

        if (!realmId) {
            return undefined;
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

        const getToken = (cb) => {
            let token : string | undefined = this.ctx.$authWarehouse.get(AuthBrowserStorageKey.ACCESS_TOKEN);
            if (typeof token === 'undefined') {
                token = this.ctx.store.getters['auth/accessToken'];
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
