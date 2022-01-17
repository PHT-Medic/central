/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export const STATION_SECRET_ENGINE_KEY = 'station_pks';

/**
 * Engine Paths:
 *
 * user_pks -> users
 * services -> robots
 * station_pks -> stations
 */

/**
 * Engine Objects:
 *
 * users/<id> {
 *     secretId: secretValue,
 *     ...
 * }
 * robots: {id, secret, ...}
 * stations: {rsa_public_key, robot_id, robot_secret, ...}
 */
