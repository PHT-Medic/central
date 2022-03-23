/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ErrorOptions } from '@typescript-error/http';
import {
    TrainManagerBuildingErrorType,
    TrainManagerBuildingStep,
} from '@personalhealthtrain/central-common';
import { BaseError } from '../error';

export class BuildingError extends BaseError {
    constructor(options: ErrorOptions) {
        options.step = options.step || TrainManagerBuildingStep.UNKNOWN;
        options.type = options.type || TrainManagerBuildingErrorType.UNKNOWN;

        super(options);
    }

    // --------------------------------------------------------------------

    public getStep() : TrainManagerBuildingStep {
        return this.getOption('step');
    }

    public getType() : TrainManagerBuildingErrorType {
        return this.getOption('type');
    }

    // -------------------------------------------------------------------

    static entrypointNotFound(step?: `${TrainManagerBuildingStep}`, message?: string) {
        return new BuildingError({
            type: TrainManagerBuildingErrorType.ENTRYPOINT_NOT_FOUND,
            step,
            message,
        });
    }

    static masterImageNotFound(step?: `${TrainManagerBuildingStep}`, message?: string) {
        return new BuildingError({
            type: TrainManagerBuildingErrorType.MASTER_IMAGE_NOT_FOUND,
            step,
            message,
        });
    }
}
