/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../type';

export type QueuePayload<
    T extends ObjectLiteral = ObjectLiteral,
    M extends ObjectLiteral = ObjectLiteral,
> = {
    data: T,
    metadata: M
};
