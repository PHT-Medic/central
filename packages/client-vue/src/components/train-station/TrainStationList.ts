/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ATitle } from '@authup/client-vue';
import type {
    TrainStation,
} from '@personalhealthtrain/core';
import {
    DomainEventSubscriptionName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/core';
import type { FiltersBuildInput } from 'rapiq';

import type { PropType, SlotsType, VNodeChild } from 'vue';
import { computed, defineComponent, h } from 'vue';
import type { ListSlotsType } from '../../core';
import {
    createList, defineListEvents, defineListProps,
} from '../../core';
import type { DomainDetailsSlotProps } from '../type';
import TrainStationDetails from './TrainStationEntity';

enum Direction {
    IN = 'in',
    OUT = 'out',
}

export default defineComponent({
    props: {
        ...defineListProps<TrainStation>(),
        realmId: {
            type: String,
        },
        sourceId: {
            type: String,
            default: undefined,
        },
        target: {
            type: String as PropType<'station' | 'train'>,
            default: DomainType.STATION,
        },
        direction: {
            type: String as PropType<'in' | 'out'>,
            default: Direction.OUT,
        },
    },
    slots: Object as SlotsType<ListSlotsType<TrainStation>>,
    emits: defineListEvents<TrainStation>(),
    async setup(props, ctx) {
        const source = computed(() => (props.target === DomainType.STATION ?
            DomainType.TRAIN :
            DomainType.STATION));

        const isSameSocketRoom = (room?: string) => {
            if (props.realmId) {
                switch (props.direction) {
                    case Direction.IN:
                        return room === buildDomainChannelName(DomainSubType.TRAIN_STATION_IN);
                    case Direction.OUT:
                        return room === buildDomainChannelName(DomainSubType.TRAIN_STATION_OUT);
                }
            } else {
                return room === buildDomainChannelName(DomainType.TRAIN_STATION);
            }

            return false;
        };

        const isSocketEventForSource = (item: TrainStation) => {
            switch (source.value) {
                case DomainType.STATION:
                    if (typeof props.sourceId === 'undefined') {
                        return props.realmId === item.station_realm_id;
                    }

                    return props.sourceId === item.station_id;
                case DomainType.TRAIN:
                    if (typeof props.sourceId === 'undefined') {
                        return props.realmId === item.train_realm_id;
                    }

                    return props.sourceId === item.train_id;
            }

            return false;
        };

        const {
            render,
            setDefaults,
        } = createList({
            type: `${DomainType.TRAIN_STATION}`,
            props,
            setup: ctx,
            socket: {
                processEvent(event) {
                    return isSameSocketRoom(event.meta.roomName) &&
                        isSocketEventForSource(event.data);
                },
                buildSubscribeEventName() {
                    if (props.realmId) {
                        if (props.direction === Direction.IN) {
                            return buildDomainEventSubscriptionFullName(
                                DomainSubType.TRAIN_STATION_IN,
                                DomainEventSubscriptionName.SUBSCRIBE,
                            );
                        }

                        return buildDomainEventSubscriptionFullName(
                            DomainSubType.TRAIN_STATION_OUT,
                            DomainEventSubscriptionName.SUBSCRIBE,
                        );
                    }

                    return buildDomainEventSubscriptionFullName(
                        DomainType.TRAIN_STATION,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    );
                },
                buildUnsubscribeEventName() {
                    if (props.realmId) {
                        if (props.direction === Direction.IN) {
                            return buildDomainEventSubscriptionFullName(
                                DomainSubType.TRAIN_STATION_IN,
                                DomainEventSubscriptionName.UNSUBSCRIBE,
                            );
                        }

                        return buildDomainEventSubscriptionFullName(
                            DomainSubType.TRAIN_STATION_OUT,
                            DomainEventSubscriptionName.UNSUBSCRIBE,
                        );
                    }

                    return buildDomainEventSubscriptionFullName(
                        DomainType.TRAIN_STATION,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    );
                },
            },
            queryFilters: (q) => {
                let filter : FiltersBuildInput<TrainStation>;

                if (props.target === DomainType.STATION) {
                    filter = {
                        'station.name': q.length > 0 ? `~${q}` : q,
                    };
                } else {
                    filter = {
                        'train.name': q.length > 0 ? `~${q}` : q,
                    };
                }

                if (props.realmId) {
                    if (props.direction === Direction.IN) {
                        filter.station_realm_id = props.realmId;
                    } else {
                        filter.train_realm_id = props.realmId;
                    }
                }

                return filter;
            },
            query: () => {
                if (props.target === DomainType.STATION) {
                    return {
                        include: ['station'],
                    };
                }

                return {
                    include: ['train'],
                };
            },
        });

        setDefaults({
            header: {
                content: () => h(ATitle, {
                    text: props.target === DomainType.STATION ?
                        'Stations' :
                        'Trains',
                    icon: true,
                    iconClass: props.target === DomainType.STATION ?
                        'fa fa-hospital' :
                        'fa-solid fa-train-tram',
                }),
            },
            item: {
                content(
                    item,
                    itemProps,
                    sections,
                ) {
                    return h(TrainStationDetails, {
                        entity: item,
                        direction: props.direction,
                        target: props.target,
                        onUpdated: itemProps.updated,
                        onDeleted: itemProps.deleted,
                        onFailed: itemProps.failed,
                    }, {
                        default: (slotProps: DomainDetailsSlotProps<TrainStation>) => {
                            if (sections.slot) {
                                return sections.slot;
                            }

                            let text : VNodeChild | undefined;

                            if (
                                props.target === DomainType.STATION &&
                                slotProps.data.station
                            ) {
                                text = h('div', [slotProps.data.station.name]);
                            } else if (
                                props.target === DomainType.TRAIN &&
                                slotProps.data.train
                            ) {
                                text = h('div', [slotProps.data.train.name]);
                            } else {
                                text = h('div', [slotProps.data.id]);
                            }

                            return [
                                sections.icon,
                                text,
                                sections.actions,
                            ];
                        },
                    });
                },
            },

            noMore: {
                content: `No more ${props.target} available...`,
            },
        });

        return () => render();
    },
});
