/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum MessageQueueSelfRoutingKey {
    COMMAND = 'rs.command',
    EVENT = 'rs.event',
}

export enum MessageQueueSelfToUIRoutingKey {
    EVENT = 'ui.rs.event',
}
