/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseError, buildErrorOptions } from '@typescript-error/http';
import { TrainManagerExtractionStep } from '@personalhealthtrain/central-common';

export class ExtractingError extends BaseError {
    constructor(step: TrainManagerExtractionStep, message?: string) {
        super(buildErrorOptions({
            message,
            step,
        }));
    }
}
