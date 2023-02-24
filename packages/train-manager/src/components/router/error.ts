/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ErrorOptionsExtended } from '../error';
import { BaseError } from '../error';
import { RouterErrorCode } from './constants';

export class RouterError extends BaseError {
    static routeEmpty(
        message?: string,
    ) {
        return new RouterError({
            code: RouterErrorCode.ROUTE_EMPTY,
            message,
        });
    }

    static operatorInvalid(
        options?: ErrorOptionsExtended,
    ) {
        return new RouterError({
            code: RouterErrorCode.OPERATOR_INVALID,
            ...(options || {}),
        });
    }
}
