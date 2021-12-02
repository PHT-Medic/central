/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SecretStorageEngineSecretPayload } from '../../../extra';

export type UserSecretEngineSecretPayload = SecretStorageEngineSecretPayload<{
    rsa_public_key?: string,
    paillier_public_key?: string
}>;
