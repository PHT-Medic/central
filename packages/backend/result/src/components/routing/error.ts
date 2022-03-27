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
    TrainManagerRoutingErrorCode,
    TrainManagerRoutingStep,
} from '@personalhealthtrain/central-common';
import { BaseError, ErrorOptionsExtended } from '../error';

export class RoutingError extends BaseError {
    constructor(options: ErrorOptions) {
        options.step = options.step || TrainManagerRoutingStep.UNKNOWN;
        options.type = options.type || TrainManagerRoutingErrorCode.UNKNOWN;

        super(options);
    }

    // --------------------------------------------------------------------

    public getStep() : TrainManagerRoutingStep {
        return this.getOption('step');
    }

    public getCode() : TrainManagerRoutingErrorCode | TrainManagerBaseErrorCode {
        return this.getOption('type');
    }

    // --------------------------------------------------------------------

    static routeEmpty(step?: `${TrainManagerRoutingStep}`, message?: string) {
        return new RoutingError({
            type: TrainManagerRoutingErrorCode.ROUTE_EMPTY,
            step,
            message,
        });
    }

    static operatorInvalid(
        options?: ErrorOptionsExtended,
    ) {
        return new RoutingError({
            type: TrainManagerRoutingErrorCode.OPERATOR_INVALID,
            ...(options || {}),
        });
    }
}
