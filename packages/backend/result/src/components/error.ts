/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseError as Base, ErrorOptions } from '@typescript-error/http';
import {
    TrainManagerBaseErrorCode,
} from '@personalhealthtrain/central-common';

export type ErrorOptionsExtended = ErrorOptions & {
    type?: string,
    step?: string | number
};

export class BaseError extends Base {
    constructor(options: ErrorOptionsExtended) {
        options.type = options.type || TrainManagerBaseErrorCode.UNKNOWN;

        super(options);
    }

    // --------------------------------------------------------------------

    static notFound(options?: ErrorOptionsExtended) {
        return new this({
            type: TrainManagerBaseErrorCode.NOT_FOUND,
            ...(options || {}),
        });
    }

    static registryNotFound(
        options?: ErrorOptionsExtended,
    ) {
        return new this({
            type: TrainManagerBaseErrorCode.REGISTRY_NOT_FOUND,
            ...(options || {}),
        });
    }

    static registryProjectNotFound(
        options?: ErrorOptionsExtended,
    ) {
        return new this({
            type: TrainManagerBaseErrorCode.REGISTRY_PROJECT_NOT_FOUND,
            ...(options || {}),
        });
    }
}
