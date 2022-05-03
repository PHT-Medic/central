/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum MessageQueueRoutingKey {
    /**
     * Aggregator(s)
     */
    AGGREGATOR_REGISTRY_EVENT = 'ui.r.event',
    AGGREGATOR_RESULT_SERVICE_EVENT = 'ui.rs.event',
    AGGREGATOR_TRAIN_BUILDER_EVENT = 'ui.tb.event',
    AGGREGATOR_TRAIN_ROUTER_EVENT = 'ui.tr.event',

    /**
     * Internal Event- & Command-Router
     */
    EVENT = 'ui.self.event',
    COMMAND = 'ui.self.command',

    /**
     * External Service Command
     */
    TRAIN_MANAGER_COMMAND = 'rs.command',
    TRAIN_BUILDER_COMMAND = 'tb',
    TRAIN_ROUTER_COMMAND = 'tr',
}
