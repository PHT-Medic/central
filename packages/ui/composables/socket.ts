/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useNuxtApp } from '#app';
import type { SocketModule } from '../core';

export function useSocket() : SocketModule {
    const nuxtApp = useNuxtApp();

    return nuxtApp.$socket;
}
