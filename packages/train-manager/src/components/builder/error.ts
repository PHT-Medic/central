/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    TrainManagerBuilderErrorCode,
} from '@personalhealthtrain/central-common';
import { BaseError } from '../error';

export class BuilderError extends BaseError {
    static entrypointNotFound(message?: string) {
        return new BuilderError({
            code: TrainManagerBuilderErrorCode.ENTRYPOINT_NOT_FOUND,
            message,
        });
    }

    static masterImageNotFound(message?: string) {
        return new BuilderError({
            code: TrainManagerBuilderErrorCode.MASTER_IMAGE_NOT_FOUND,
            message,
        });
    }
}
