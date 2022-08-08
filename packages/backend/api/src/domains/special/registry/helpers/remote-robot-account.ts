/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client as HarborClient, RobotAccount } from '@hapic/harbor';
import {
    HTTPClientKey,
    REGISTRY_PROJECT_SECRET_ENGINE_KEY,
    RegistryProjectSecretStoragePayload,
} from '@personalhealthtrain/central-common';
import { isClientError, useClient } from 'hapic';
import { Client as VaultClient } from '@hapic/vault';
import { ApiKey } from '../../../../config';

export async function ensureRemoteRegistryProjectAccount(
    httpClient: HarborClient,
    context: {
        name: string,
        account: Partial<RobotAccount>
    },
) : Promise<RobotAccount> {
    let robotAccount : RobotAccount | undefined;

    let secretStorageData : RegistryProjectSecretStoragePayload | undefined;

    if (
        !context.account.id ||
        !context.account.name ||
        !context.account.secret
    ) {
        try {
            robotAccount = await httpClient.robotAccount.create(context.name);
        } catch (e) {
            if (e?.response?.status === 409) {
                const response = await useClient<VaultClient>(HTTPClientKey.VAULT)
                    .keyValue.find<RegistryProjectSecretStoragePayload>(REGISTRY_PROJECT_SECRET_ENGINE_KEY, context.name);

                if (
                    response &&
                    response.data
                ) {
                    secretStorageData = response.data;
                }

                if (
                    !!secretStorageData &&
                    !!secretStorageData.account_id &&
                    !!secretStorageData.account_name &&
                    !!secretStorageData.account_secret
                ) {
                    robotAccount = {
                        id: secretStorageData.account_id,
                        name: secretStorageData.account_name,
                        secret: secretStorageData.account_secret,
                    };

                    await httpClient.robotAccount.refreshSecret(
                        robotAccount.id,
                        robotAccount.secret,
                    );
                } else {
                    robotAccount = await httpClient.robotAccount
                        .find(context.name, true);

                    secretStorageData = {
                        account_id: `${robotAccount.id}`,
                        account_name: robotAccount.name,
                        account_secret: robotAccount.secret,
                    };
                }

                await useClient<VaultClient>(ApiKey.VAULT)
                    .keyValue.save(
                        REGISTRY_PROJECT_SECRET_ENGINE_KEY,
                        context.name,
                        secretStorageData,
                    );
            } else {
                throw e;
            }
        }

        if (robotAccount) {
            context.account.id = `${robotAccount.id}`;
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
            await httpClient.robotAccount.refreshSecret(
                robotAccount.id,
                robotAccount.secret,
            );

            secretStorageData = {
                account_id: `${robotAccount.id}`,
                account_name: robotAccount.name,
                account_secret: robotAccount.secret,
            };

            await useClient<VaultClient>(ApiKey.VAULT)
                .keyValue.save(
                    REGISTRY_PROJECT_SECRET_ENGINE_KEY,
                    context.name,
                    secretStorageData,
                );
        } catch (e) {
            if (isClientError(e)) {
                if (
                    e.response &&
                    e.response.status === 404
                ) {
                    return ensureRemoteRegistryProjectAccount(httpClient, {
                        name: context.name,
                        account: {
                            id: null,
                            name: null,
                            secret: null,
                        },
                    });
                }
            }

            throw e;
        }
    }

    return robotAccount;
}
