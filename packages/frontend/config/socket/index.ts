/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import {
    SocketClientToServerEvents,
    SocketServerToClientEvents,
    buildSocketRealmNamespaceName,
} from '@personalhealthtrain/ui-common';
import { Oauth2TokenResponse } from '@typescript-auth/core';
import { BaseError } from '@typescript-error/core';
import { Manager, ManagerOptions, Socket } from 'socket.io-client';
import { AuthStoreKey } from '@/store/auth';

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
            realmId = this.ctx.store.getters['auth/userRealmId'];
        }
        if (!realmId) {
            const user = this.ctx.$authWarehouse.get(AuthStoreKey.user);
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
            throw new BaseError('Manager not initialized...');
        }
        if (this.sockets[namespace]) {
            return this.sockets[namespace];
        }

        const getToken = (cb) => {
            let token : Oauth2TokenResponse | undefined = this.ctx.$authWarehouse.get(AuthStoreKey.token);
            if (typeof token === 'undefined') {
                token = this.ctx.store.getters['auth/token'];
            }

            if (typeof token !== 'undefined') {
                return cb({ token: token.access_token });
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
