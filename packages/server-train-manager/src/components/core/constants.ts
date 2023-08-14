/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum CoreEvent {
    CONFIGURING = 'configuring',
    CONFIGURED = 'configured',

    DESTROYING = 'destroying',
    DESTROYED = 'destroyed',

    FAILED = 'failed',

    NONE = 'none',
}

export enum CoreCommand {
    CONFIGURE = 'configure',
    DESTROY = 'destroy',
}
