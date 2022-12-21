/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum AggregatorRegistryEvent {
    TRAIN_INITIALIZED = 'trainInitialized',
    TRAIN_STARTED = 'trainStarted',
    TRAIN_MOVED = 'trainMoved',
    TRAIN_FINISHED = 'trainFinished',
}

export enum AggregatorTrainBuilderEvent {
    STARTED = 'trainBuildStarted',
    STOPPED = 'trainBuildStopped',
    FAILED = 'trainBuildFailed',
    FINISHED = 'trainBuildFinished',
}

export enum AggregatorTrainRouterEvent {
    STOPPED = 'trainStopped',
    FAILED = 'trainFailed',
}
