/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ErrorOptions } from '@typescript-error/http';
import {
    TrainManagerBaseErrorCode,
    TrainManagerExtractingErrorCode,
    TrainManagerExtractingStep,
} from '@personalhealthtrain/central-common';
import { BaseError } from '../error';

export class ExtractingError extends BaseError {
    constructor(options: ErrorOptions) {
        options.step = options.step || TrainManagerExtractingStep.UNKNOWN;
        options.type = options.type || TrainManagerExtractingErrorCode.UNKNOWN;

        super(options);
    }

    // --------------------------------------------------------------------

    public getStep() : TrainManagerExtractingStep {
        return this.getOption('step');
    }

    public getType() : TrainManagerExtractingErrorCode | TrainManagerBaseErrorCode {
        return this.getOption('type');
    }
}
