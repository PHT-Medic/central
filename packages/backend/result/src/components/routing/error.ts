/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseError, ErrorOptions } from '@typescript-error/http';
import { TrainManagerRoutingErrorType, TrainManagerRoutingStep } from '@personalhealthtrain/central-common';

export class RoutingError extends BaseError {
    constructor(options: ErrorOptions) {
        options.step = options.step || TrainManagerRoutingStep.UNKNOWN;
        options.type = options.type || TrainManagerRoutingErrorType.UNKNOWN;

        super(options);
    }

    // --------------------------------------------------------------------

    public getStep() : TrainManagerRoutingStep {
        return this.getOption('step');
    }

    public getType() : TrainManagerRoutingErrorType {
        return this.getOption('type');
    }

    // --------------------------------------------------------------------

    static trainNotFound(step?: `${TrainManagerRoutingStep}`, message?: string) {
        return new RoutingError({
            type: TrainManagerRoutingErrorType.TRAIN_NOT_BUILD,
            step,
            message,
        });
    }
}
