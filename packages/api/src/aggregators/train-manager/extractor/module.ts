/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithError } from '@personalhealthtrain/central-server-common';
import { ComponentError, isComponentContextWithError } from '@personalhealthtrain/central-server-common';
import type {
    ExtractorEventContext,
} from '@personalhealthtrain/train-manager';
import {
    ComponentName, ExtractorCommand,
    ExtractorEvent,
} from '@personalhealthtrain/train-manager';
import {
    TrainBuildStatus,
    TrainResultStatus,
} from '@personalhealthtrain/central-common';
import { useDataSource } from 'typeorm-extension';
import { TrainEntity } from '../../../domains/train';
import type { TrainLogSaveContext } from '../../../domains/train-log';
import { saveTrainLog } from '../../../domains/train-log';

export async function handleTrainManagerExtractorEvent(
    context: ExtractorEventContext | ComponentContextWithError<ExtractorEventContext>,
) {
    const dataSource = await useDataSource();
    const trainRepository = dataSource.getRepository(TrainEntity);

    const entity = await trainRepository.findOneBy({ id: context.data.id });
    if (!entity) {
        return;
    }

    // -------------------------------------------------------------------------------

    let trainLogContext : TrainLogSaveContext = {
        train: entity,
        component: ComponentName.EXTRACTOR,
        command: context.command,
        event: context.event,
    };

    // -------------------------------------------------------------------------------

    let status : TrainResultStatus;

    switch (context.event) {
        case ExtractorEvent.DOWNLOADING:
            status = TrainResultStatus.DOWNLOADING;
            break;
        case ExtractorEvent.DOWNLOADED:
            status = TrainResultStatus.DOWNLOADED;
            break;
        case ExtractorEvent.EXTRACTING:
            status = TrainResultStatus.PROCESSING;
            break;
        case ExtractorEvent.EXTRACTED:
            status = TrainResultStatus.FINISHED;
            break;
        case ExtractorEvent.FAILED: {
            if (context.command === ExtractorCommand.EXTRACT) {
                status = TrainResultStatus.FAILED;
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
    }

    entity.result_status = status;

    await trainRepository.save(entity);

    await saveTrainLog({
        ...trainLogContext,
        status,
    });
}
