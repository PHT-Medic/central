/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Options } from '@ebec/http';
import { ComponentError } from '@personalhealthtrain/central-server-common';
import { ErrorCode } from './constants';

export type ErrorOptionsExtended = Options & {
    type?: string,
    command?: string,
    step?: string | number
};

export class BaseError extends ComponentError {
    public getStep() : string {
        return this.getOption('step');
    }

    public getCode() : string {
        return `${this.getOption('code')}`;
    }

    // --------------------------------------------------------------------

    static notFound(options?: ErrorOptionsExtended) {
        return new this({
            code: ErrorCode.NOT_FOUND,
            ...(options || {}),
        });
    }

    static registryNotFound(
        options?: ErrorOptionsExtended,
    ) {
        return new this({
            code: ErrorCode.REGISTRY_NOT_FOUND,
            ...(options || {}),
        });
    }

    static registryProjectNotFound(
        options?: ErrorOptionsExtended,
    ) {
        return new this({
            code: ErrorCode.REGISTRY_PROJECT_NOT_FOUND,
            ...(options || {}),
        });
    }
}
