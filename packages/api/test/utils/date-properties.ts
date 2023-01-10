/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from '@personalhealthtrain/central-common';

export function removeDateProperties<
T extends Record<string, any>,
>(input: T) : T {
    if (hasOwnProperty(input, 'created_at')) {
        delete input.created_at;
    }

    if (hasOwnProperty(input, 'updated_at')) {
        delete input.updated_at;
    }

    // todo: remove other date values.

    return input;
}
