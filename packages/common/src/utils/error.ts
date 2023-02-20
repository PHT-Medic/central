/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from './has-own-property';

export function isError(e: unknown) {
    return typeof e === 'object' && e && hasOwnProperty(e, 'message');
}
