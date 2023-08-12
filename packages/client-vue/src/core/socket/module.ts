/*
 * Copyright (c) 2021-2023.
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
import type { ManagerOptions, Socket } from 'socket.io-client';
import { Manager } from 'socket.io-client';
import type { AuthupStore } from '../authup';
import { injectAuthupStore } from '../authup';

type SocketModuleManagerConfiguration = {
    url: string,
    options?: Partial<ManagerOptions>,
    store?: AuthupStore
};

export type SocketClient = Socket<SocketServerToClientEvents, SocketClientToServerEvents>;

export class SocketManager {
    protected manager : Manager;

    protected sockets : Record<string, SocketClient>;

    protected store : AuthupStore | undefined;

    //--------------------------------------------------------------------

    constructor(
        managerConfiguration : SocketModuleManagerConfiguration,
    ) {
        this.sockets = {};

        this.manager = new Manager(managerConfiguration.url, {
            autoConnect: false,
            reconnectionAttempts: 10,
            ...managerConfiguration.options,
        });

        this.store = managerConfiguration.store;
    }

    //--------------------------------------------------------------------

    public forRealm(realmId?: string | null) : SocketClient {
        if (!realmId && this.store) {
            realmId = this.store.realmId;
        }

        if (!realmId) {
            return this.use();
        }

        return this.use(buildSocketRealmNamespaceName(realmId));
    }

    use(namespace = '/') : SocketClient {
        if (typeof this.manager === 'undefined') {
            throw new Error('Manager not initialized...');
        }
        if (this.sockets[namespace]) {
            return this.sockets[namespace];
        }

        const getToken = (cb: CallableFunction) => {
            const store = injectAuthupStore();
            const token = store.accessToken;

            if (token) {
                return cb({ token });
            }

            return cb();
        };

        getToken.bind(this);

        const socket : SocketClient = this.manager.socket(namespace, {
            auth: getToken,
        });

        if (typeof window !== 'undefined') {
            socket.connect();
        }

        this.sockets[namespace] = socket;

        return socket;
    }

    unUse(namespace = '/') {
        if (this.sockets[namespace]) {
            this.sockets[namespace].disconnect();
            delete this.sockets[namespace];
        }
    }

    //--------------------------------------------------------------------

    reconnect() : void;

    reconnect(namespace: string) : void;

    reconnect(namespace?: string) : void {
        if (typeof namespace !== 'string') {
            const keys = Object.keys(this.sockets);
            for (let i = 0; i < keys.length; i++) {
                this.reconnect(keys[i]);
            }

            return;
        }

        if (!this.sockets[namespace]) {
            return;
        }

        const socket = this.sockets[namespace];
        socket.disconnect();

        setTimeout(() => {
            socket.connect();
        }, 0);
    }
}
