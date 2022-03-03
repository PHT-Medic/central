/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientDriverInstance } from '@trapi/client';
import { RegistryCommandType } from './registry';
import { ServiceID } from './constants';
import { ServiceIDType } from './type';
import { SingleResourceResponse } from '../../type';
import { SecretStorageCommand } from './secret-engine';

export class ServiceAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async runCommand(
        id: ServiceIDType | ServiceID,
        command: string,
        data?: Record<string, any>,
    ): Promise<SingleResourceResponse<Record<string, any>>> {
        data = data || {};

        const { data: resultData } = await this.client.post(`services/${id}/command`, { command, ...data });

        return resultData;
    }

    async runRegistryCommand(
        command: RegistryCommandType,
        data: Record<string, any>,
    ): Promise<SingleResourceResponse<Record<string, any>>> {
        return this.runCommand(ServiceID.REGISTRY, command, data);
    }

    async runSecretStorageCommand(
        command: SecretStorageCommand,
        data: Record<string, any>,
    ): Promise<SingleResourceResponse<Record<string, any>>> {
        return this.runCommand(ServiceID.SECRET_STORAGE, command, data);
    }
}
