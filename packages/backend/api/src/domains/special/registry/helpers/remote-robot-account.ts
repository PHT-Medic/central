/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HTTPClientKey,
    HarborAPI,
    HarborRobotAccount,
    REGISTRY_PROJECT_SECRET_ENGINE_KEY,
    RegistryProjectSecretStoragePayload,
    VaultAPI,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { ApiKey } from '../../../../config/api';

export async function ensureRemoteRegistryProjectAccount(
    httpClient: HarborAPI,
    context: {
        name: string,
        account: Partial<HarborRobotAccount>
    },
) : Promise<HarborRobotAccount> {
    let robotAccount : HarborRobotAccount | undefined;

    if (
        !context.account.id ||
        !context.account.name ||
        !context.account.secret
    ) {
        try {
            robotAccount = await httpClient.robotAccount.create(context.name);
        } catch (e) {
            if (e?.response?.status === 409) {
                const response = await useClient<VaultAPI>(HTTPClientKey.VAULT)
                    .keyValue.find<RegistryProjectSecretStoragePayload>(REGISTRY_PROJECT_SECRET_ENGINE_KEY, context.name);

                if (
                    response &&
                    response.data.account_id &&
                    response.data.account_name &&
                    response.data.account_secret
                ) {
                    robotAccount = {
                        id: response.data.account_id,
                        name: response.data.account_name,
                        secret: response.data.account_secret,
                    };

                    await useClient<HarborAPI>(ApiKey.HARBOR).robotAccount.refreshSecret(
                        robotAccount.id,
                        robotAccount.secret,
                    );
                } else {
                    robotAccount = await useClient<HarborAPI>(ApiKey.HARBOR).robotAccount
                        .find(context.name, true);

                    await useClient<VaultAPI>(ApiKey.VAULT)
                        .keyValue.save(
                            REGISTRY_PROJECT_SECRET_ENGINE_KEY,
                            context.name,
                            {
                                account_id: robotAccount.id,
                                account_name: robotAccount.name,
                                account_secret: robotAccount.secret,
                            } as RegistryProjectSecretStoragePayload,
                        );
                }
            }
        }

        if (robotAccount) {
            context.account.id = `${robotAccount.id}`;
            context.account.name = robotAccount.name;
            context.account.secret = robotAccount.secret;
        }
    }

    if (
        context.account.id
    ) {
        // just update the name for insurance ;)
        await httpClient.robotAccount
            .update(context.account.id, context.name, {
                name: context.account.name,
            });
    }

    return robotAccount;
}
