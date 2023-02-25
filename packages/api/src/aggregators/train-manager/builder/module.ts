/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ComponentError, isComponentContextWithError } from '@personalhealthtrain/central-server-common';
import type { ComponentContextWithError } from '@personalhealthtrain/central-server-common';
import {
    BuilderCommand,
    BuilderEvent,
    ComponentName,
} from '@personalhealthtrain/train-manager';
import type {
    BuilderEventContext,
} from '@personalhealthtrain/train-manager';
import {

    TrainBuildStatus,
} from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import type { TrainLogSaveContext } from '../../../domains/core/train-log';
import { saveTrainLog } from '../../../domains/core/train-log';
import { TrainEntity } from '../../../domains/core/train';

export async function handleTrainManagerBuilderEvent(
    context: BuilderEventContext | ComponentContextWithError<BuilderEventContext>,
) {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(TrainEntity);

    const entity = await repository.findOneBy({ id: context.data.id });
    if (!entity) {
        return;
    }

    let trainLogContext : TrainLogSaveContext = {
        train: entity,
        component: ComponentName.BUILDER,
        command: context.command,
        event: context.event,
    };

    switch (context.event) {
        case BuilderEvent.NONE:
            entity.build_status = null;
            break;
        case BuilderEvent.BUILDING:
            entity.build_status = TrainBuildStatus.STARTED;

            trainLogContext.status = TrainBuildStatus.STARTED;
            break;
        case BuilderEvent.FAILED: {
            if (context.command === BuilderCommand.BUILD) {
                entity.build_status = TrainBuildStatus.FAILED;
            }

            if (
                isComponentContextWithError(context) &&
                context.error instanceof ComponentError
            ) {
                trainLogContext = {
                    ...trainLogContext,
                    status: TrainBuildStatus.FAILED,
                    statusMessage: context.error.message,

                    error: true,
                    errorCode: `${context.error.getCode()}`,
                    step: context.error.getStep(),
                };
            }

            break;
        }
        case BuilderEvent.PUSHED:
            entity.build_status = TrainBuildStatus.FINISHED;

            trainLogContext.status = TrainBuildStatus.FINISHED;
            break;
    }

    if (
        context.event !== BuilderEvent.FAILED &&
        context.event !== BuilderEvent.NONE
    ) {
        entity.run_status = null;
        entity.run_station_index = null;
        entity.run_status = null;
        entity.result_status = null;
    }

    await repository.save(entity);

    await saveTrainLog(trainLogContext);
}
