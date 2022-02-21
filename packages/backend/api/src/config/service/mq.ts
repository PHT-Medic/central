/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Self
 */
export enum MessageQueueSelfRoutingKey {
    COMMAND = 'ui.self.command',
    EVENT = 'ui.self.event',
}

/**
 * Dispatcher
 */
export enum MessageQueueDispatcherRoutingKey {
    EVENT_IN = 'ui.dispatcher.event',

    EVENT_OUT = 'dispatcher.event',
}

/**
 * Email (Service)
 */
export enum MessageQueueEmailServiceRoutingKey {
    EVENT_OUT = 'en.event',
}

/**
 * ResultService
 */
export enum MessageQueueResultServiceRoutingKey {
    EVENT_IN = 'ui.rs.event',

    COMMAND_OUT = 'rs.command',
}

/**
 * TrainBuilder
 */
export enum MessageQueueTrainBuilderRoutingKey {
    EVENT_IN = 'ui.tb.event',

    COMMAND_OUT = 'tb',
}

/**
 * TrainRouter
 */
export enum MessageQueueTrainRouterRoutingKey {
    EVENT_IN = 'ui.tr.event',

    COMMAND_OUT = 'tr',
}
