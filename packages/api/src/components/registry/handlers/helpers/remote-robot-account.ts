/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildRobotPermissionForAllResources, isClientErrorWithStatusCode } from '@hapic/harbor';
import type { HarborClient, Robot } from '@hapic/harbor';
import { useClient as useVaultClient } from '@hapic/vault';
import type { RegistryProjectSecretStoragePayload } from '@personalhealthtrain/central-common';
import {
    REGISTRY_PROJECT_SECRET_ENGINE_KEY,
} from '@personalhealthtrain/central-common';
import { isObject } from 'locter';

async function saveRegistryProject(name: string, data: RegistryProjectSecretStoragePayload) {
    try {
        await useVaultClient()
            .keyValueV1.create({
                mount: REGISTRY_PROJECT_SECRET_ENGINE_KEY,
                path: name,
                data,
            });
    } catch (e) {
        if (isClientErrorWithStatusCode(e, 404)) {
            await useVaultClient().mount.create({
                path: REGISTRY_PROJECT_SECRET_ENGINE_KEY,
                data: {
                    type: 'kv',
                    options: {
                        version: 1,
                    },
                },
            });

            await saveRegistryProject(name, data);
        }
    }
}

export async function ensureRemoteRegistryProjectAccount(
    httpClient: HarborClient,
    context: {
        name: string,
        account: Partial<Robot>
    },
) : Promise<Robot> {
    let robotAccount : Robot | undefined;

    let secretStorageData : RegistryProjectSecretStoragePayload | undefined;

    if (
        !context.account.id ||
        !context.account.name ||
        !context.account.secret
    ) {
        try {
            robotAccount = await httpClient.robot.create({
                name: context.name,
                permissions: [buildRobotPermissionForAllResources(context.name)], // todo: check if namespace is correct
            });
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 409)) {
                try {
                    const response = await useVaultClient()
                        .keyValueV1
                        .getOne<RegistryProjectSecretStoragePayload>({
                            mount: REGISTRY_PROJECT_SECRET_ENGINE_KEY,
                            path: context.name,
                        });

                    if (
                        response &&
                        response.data
                    ) {
                        secretStorageData = response.data;
                    }
                } catch (e) {
                    if (!isClientErrorWithStatusCode(e, 404)) {
                        throw e;
                    }
                }

                if (
                    isObject(secretStorageData) &&
                    !!secretStorageData.account_id &&
                    !!secretStorageData.account_name &&
                    !!secretStorageData.account_secret
                ) {
                    robotAccount = {
                        id: parseInt(secretStorageData.account_id, 10),
                        name: secretStorageData.account_name,
                        secret: secretStorageData.account_secret,
                    };

                    await httpClient.robot.updateSecret(
                        robotAccount.id,
                        robotAccount.secret,
                    );
                } else {
                    const response = await httpClient.robot
                        .getMany({
                            query: {
                                q: {
                                    name: '1',
                                },
                                page_size: 1,
                            },
                        });

                    const robotAccount = response.data.pop();
                    if (robotAccount) {
                        const { secret } = await httpClient.robot.updateSecret(
                            robotAccount.id,
                        );
                        secretStorageData = {
                            account_id: `${robotAccount.id}`,
                            account_name: robotAccount.name,
                            account_secret: secret,
                        };
                    }
                }

                await saveRegistryProject(context.name, secretStorageData);
            } else {
                throw e;
            }
        }

        if (robotAccount) {
            context.account.id = robotAccount.id;
            context.account.name = robotAccount.name;
            context.account.secret = robotAccount.secret;
        }
    } else {
        robotAccount = {
            id: context.account.id,
            name: context.account.name,
            secret: context.account.secret,
        };

        try {
            await httpClient.robot.updateSecret(
                robotAccount.id,
                robotAccount.secret,
            );

            secretStorageData = {
                account_id: `${robotAccount.id}`,
                account_name: robotAccount.name,
                account_secret: robotAccount.secret,
            };

            await saveRegistryProject(context.name, secretStorageData);
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 404)) {
                return ensureRemoteRegistryProjectAccount(httpClient, {
                    name: context.name,
                    account: {
                        id: null,
                        name: null,
                        secret: null,
                    },
                });
            }

            throw e;
        }
    }

    return robotAccount;
}
