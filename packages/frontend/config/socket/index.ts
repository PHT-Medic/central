/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import { SocketClientToServerEvents, SocketServerToClientEvents } from '@personalhealthtrain/ui-common';
import { Oauth2TokenResponse } from '@typescript-auth/core';
import { BaseError } from '@typescript-error/core';
import { Manager, ManagerOptions, Socket } from 'socket.io-client';

type SocketModuleManagerConfiguration = {
    url: string,
    options?: Partial<ManagerOptions>
};

type SocketInterface = Socket<SocketServerToClientEvents, SocketClientToServerEvents>;

export class SocketModule {
    protected ctx: Context;

    protected manager : Manager;

    protected sockets : Map<string, SocketInterface>;

    //--------------------------------------------------------------------

    constructor(ctx: Context, managerConfiguration : SocketModuleManagerConfiguration) {
        this.ctx = ctx;
        this.sockets = new Map<string, SocketInterface>();

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
                case 'auth/setToken':
                    this.sockets.forEach((value: SocketInterface, key: string) => {
                        this.reconnect(key);
                    });
                    break;
            }
        });
    }

    //--------------------------------------------------------------------

    public use(namespace = '/') : SocketInterface {
        if (typeof this.manager === 'undefined') {
            throw new BaseError('Manager not initialized...');
        }

        let socket = this.sockets.get(namespace);
        if (typeof socket !== 'undefined') {
            return socket;
        }

        const getToken = (cb) => {
            let token : Oauth2TokenResponse | undefined = this.ctx.$authWarehouse.get('token');
            if (typeof token === 'undefined') {
                token = this.ctx.store.getters['auth/token'];
            }

            if (typeof token !== 'undefined') {
                return cb({ token: token.access_token });
            }

            return cb();
        };

        getToken.bind(this);

        socket = this.manager.socket(namespace, {
            auth: getToken,
        });

        if (!process.server) {
            socket.connect();
        }

        this.sockets.set(namespace, socket);

        return socket;
    }

    public unUse(namespace = '/') {
        if (this.sockets.has(namespace)) {
            this.sockets.delete(namespace);
        }
    }

    //--------------------------------------------------------------------

    public reconnect(namespace: string) {
        if (!this.sockets.has(namespace)) return;

        const socket = <SocketInterface> this.sockets.get(namespace);
        socket.disconnect();

        setTimeout(() => {
            socket.connect();
        }, 0);

        this.sockets.set(namespace, socket);
    }
}
