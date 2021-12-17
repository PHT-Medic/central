/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { APIType, SingleResourceResponse, useAPI } from '../../../modules';
import { RegistryCommandType } from './harbor';
import { ServiceID } from './constants';
import { SecretStorageCommand } from '../secret-engine';
import { ServiceIDType } from './type';

export async function executeAPIServiceTask(
    id: ServiceIDType,
    command: string,
    data: Record<string, any>,
) : Promise<SingleResourceResponse<Record<string, any>>> {
    const { data: resultData } = await useAPI(APIType.DEFAULT).post(`services/${id}/command`, { command, ...data });

    return resultData;
}

export async function executeAPIRegistryServiceCommand(
    command: RegistryCommandType,
    data: Record<string, any>,
) : Promise<SingleResourceResponse<Record<string, any>>> {
    return executeAPIServiceTask(ServiceID.REGISTRY, command, data);
}

export async function executeAPISecretStorageServiceCommand(
    command: SecretStorageCommand,
    data: Record<string, any>,
) : Promise<SingleResourceResponse<Record<string, any>>> {
    return executeAPIServiceTask(ServiceID.SECRET_STORAGE, command, data);
}
