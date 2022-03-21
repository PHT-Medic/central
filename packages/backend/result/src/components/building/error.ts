/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseError, ErrorOptions } from '@typescript-error/http';
import {
    TrainManagerBuildingErrorType,
    TrainManagerBuildingStep,
} from '@personalhealthtrain/central-common';

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

    // --------------------------------------------------------------------

    static BuildingError(step?: `${TrainManagerBuildingStep}`, message?: string) {
        return new BuildingError({
            type: TrainManagerBuildingErrorType.TRAIN_NOT_BUILD,
            step,
            message,
        });
    }
}
