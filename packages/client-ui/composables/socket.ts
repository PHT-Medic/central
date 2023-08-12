/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SocketManager } from '@personalhealthtrain/client-vue';
import { useNuxtApp } from '#app';

export function useSocket() : SocketManager {
    const nuxtApp = useNuxtApp();

    return nuxtApp.$socket;
}
