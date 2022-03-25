/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ErrorOptions } from '@typescript-error/http';
import {
    TrainManagerRoutingErrorType,
    TrainManagerRoutingStep,
} from '@personalhealthtrain/central-common';
import { BaseError } from '../error';

export class RoutingError extends BaseError {
    constructor(options: ErrorOptions) {
        options.step = options.step || TrainManagerRoutingStep.UNKNOWN;
        options.type = options.type || TrainManagerRoutingErrorType.UNKNOWN;

        super(options);
    }

    static routeEmpty(step?: `${TrainManagerRoutingStep}`, message?: string) {
        return new RoutingError({
            type: TrainManagerRoutingErrorType.ROUTE_EMPTY,
            step,
            message,
        });
    }
}
