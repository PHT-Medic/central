/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type StationSecretStoragePayload = {
    rsa_public_key: string,
    registry_robot_name?: string,
    registry_robot_id?: number,
    registry_robot_secret?: string
};
