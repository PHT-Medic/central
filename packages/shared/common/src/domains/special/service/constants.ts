/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum ServiceID {
    // Core Service(s)
    SYSTEM = 'SYSTEM',
    TRAIN_BUILDER = 'TRAIN_BUILDER',
    TRAIN_ROUTER = 'TRAIN_ROUTER',
    EMAIL_SERVICE = 'EMAIL_SERVICE',

    // Third Party Service(s)
    GITHUB = 'GITHUB',
    REGISTRY = 'REGISTRY',
    SECRET_STORAGE = 'SECRET_STORAGE',
}