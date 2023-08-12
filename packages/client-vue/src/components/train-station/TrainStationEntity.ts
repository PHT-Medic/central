/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainSubType,
    DomainType,
    buildDomainChannelName,
} from '@personalhealthtrain/central-common';
import type {
    TrainStation,
} from '@personalhealthtrain/central-common';
import type { FiltersBuildInput } from 'rapiq';
import {
    defineComponent,
    h,
} from 'vue';
import type { PropType, VNodeChild } from 'vue';
import {
    createEntityManager, defineEntityManagerEvents, injectAPIClient,
} from '../../core';

enum Direction {
    IN = 'in',
    OUT = 'out',
}

enum Target {
    TRAIN = 'train',
    STATION = 'station',
}

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<TrainStation>,
        },
        entityId: {
            type: String,
        },
        // todo: rename to where
        filters: {
            type: Object as PropType<FiltersBuildInput<TrainStation>>,
        },
        direction: {
            type: String as PropType<`${Direction.IN}` | `${Direction.OUT}`>,
        },
        target: {
            type: String as PropType<`${Target.STATION}` | `${Target.TRAIN}`>,
        },
    },
    emits: defineEntityManagerEvents<TrainStation>(),
    async setup(props, setup) {
        const manager = createEntityManager({
            realmId: (entity) => {
                if (!entity) {
                    return undefined;
                }

                if (props.target === Target.TRAIN) {
                    return entity.train_realm_id;
                }

                if (props.target === Target.STATION) {
                    return entity.station_realm_id;
                }

                return undefined;
            },
            type: `${DomainType.TRAIN_STATION}`,
            setup,
            props,
            socket: {
                processEvent(event, realmId) {
                    if (!realmId) {
                        return true;
                    }

                    if (props.target === Target.TRAIN) {
                        return realmId === event.data.train_realm_id;
                    }

                    if (props.target === Target.STATION) {
                        return realmId === event.data.station_realm_id;
                    }

                    return false;
                },
                buildChannelName(id) {
                    if (props.direction === Direction.IN) {
                        return buildDomainChannelName(DomainSubType.TRAIN_STATION_IN, id);
                    }

                    if (props.direction === Direction.OUT) {
                        return buildDomainChannelName(DomainSubType.TRAIN_STATION_OUT, id);
                    }

                    return buildDomainChannelName(DomainType.TRAIN_STATION, id);
                },
            },
        });

        await manager.resolve();

        if (
            manager.data.value &&
            props.target &&
            !manager.data.value[props.target]
        ) {
            if (props.target === Target.TRAIN) {
                manager.data.value[props.target] = await injectAPIClient()
                    .train.getOne(manager.data.value.train_id);
            } else {
                manager.data.value[props.target] = await injectAPIClient()
                    .station.getOne(manager.data.value.station_id);
            }
        }

        return () => {
            const fallback = () : VNodeChild => {
                if (
                    props.target &&
                    manager.data.value &&
                    manager.data.value[props.target]
                ) {
                    if (props.target === Target.TRAIN) {
                        return h('div', [
                            manager.data.value?.train.name,
                        ]);
                    }
                    if (props.target === Target.STATION) {
                        return h('div', [
                            manager.data.value?.station.name,
                        ]);
                    }
                }

                return [
                    manager.data?.value?.id,
                ];
            };

            return manager.render(fallback);
        };
    },
});
