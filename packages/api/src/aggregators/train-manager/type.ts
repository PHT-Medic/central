/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
export type AggregatorTrainManagerQueuePayload<T extends Record<string, any>> = {
    data: T,
    metadata: {
        command: string,
        event: string,
        component: string
    }
};
