/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseError as Base, ErrorOptions } from '@typescript-error/http';
import {
    TrainManagerErrorCode,
} from '@personalhealthtrain/central-common';

export type ErrorOptionsExtended = ErrorOptions & {
    type?: string,
    command?: string,
    step?: string | number
};

export class BaseError extends Base {
    public getStep() : string {
        return this.getOption('step');
    }

    public getCode() : string | number {
        return this.getOption('code');
    }

    // --------------------------------------------------------------------

    static notFound(options?: ErrorOptionsExtended) {
        return new this({
            code: TrainManagerErrorCode.NOT_FOUND,
            ...(options || {}),
        });
    }

    static registryNotFound(
        options?: ErrorOptionsExtended,
    ) {
        return new this({
            code: TrainManagerErrorCode.REGISTRY_NOT_FOUND,
            ...(options || {}),
        });
    }

    static registryProjectNotFound(
        options?: ErrorOptionsExtended,
    ) {
        return new this({
            code: TrainManagerErrorCode.REGISTRY_PROJECT_NOT_FOUND,
            ...(options || {}),
        });
    }
}
