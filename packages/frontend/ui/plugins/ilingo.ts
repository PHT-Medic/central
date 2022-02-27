/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import { Ilingo } from 'ilingo';
import { Inject } from '@nuxt/types/app';

export default async (ctx: Context, inject: Inject) => {
    const ilingo = new Ilingo();

    inject('ilingo', ilingo);
};
