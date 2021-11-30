/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SecretStorageEngineSecretPayload } from '../../../extra';

export type StationSecretEngineSecretPayload = SecretStorageEngineSecretPayload<{
    rsa_station_public_key: string
}>;
