/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Meta } from 'express-validator';
import { ExpressRequest } from '../type';

export type ExpressValidatorMeta = Meta & {
    req: ExpressRequest
};

export type ExpressValidationResult<
    T extends Record<string, any>,
    M extends Record<string, any> = Record<string, any>,
    > = {
        data: Partial<T>,
        meta?: M
    };
