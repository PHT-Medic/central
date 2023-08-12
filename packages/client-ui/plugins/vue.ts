/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Options, SocketManager } from '@personalhealthtrain/client-vue';
import { install } from '@personalhealthtrain/client-vue';
import type { Pinia } from 'pinia';
import { ref } from 'vue';
import { defineNuxtPlugin } from '#app';
import { useAuthStore } from '../store/auth';

export default defineNuxtPlugin((ctx) => {
    const authupStore = useAuthStore(ctx.$pinia as Pinia);
    const socketManager = (ctx.$socket as SocketManager);

    const accessToken = ref<string | undefined>();

    authupStore.$subscribe((mutation, state) => {
        if (state.accessToken !== accessToken.value) {
            accessToken.value = state.accessToken;
            socketManager.reconnect();
        }
    });

    const options : Options = {
        apiClient: ctx.$api,
        authupApiClient: ctx.$authupAPI,
        authupStore,
        socketManager,
    };

    ctx.vueApp.use(install, options);
});
