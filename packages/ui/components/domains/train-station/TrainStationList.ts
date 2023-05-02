/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    SocketClientToServerEvents,
    SocketServerToClientEventContext,
    SocketServerToClientEvents,
    TrainStation, TrainStationEventContext,
} from '@personalhealthtrain/central-common';
import {
    DomainEventSubscriptionName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName, buildSocketTrainStationRoomName,
} from '@personalhealthtrain/central-common';
import type { FiltersBuildInput } from 'rapiq/dist/parameter';

import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { Socket } from 'socket.io-client';
import { DomainEventName } from '@authup/core';
import type { BuildInput } from 'rapiq';
import { realmIdForSocket } from '../../../composables/domain/realm';
import { useSocket } from '../../../composables/socket';
import type {
    DomainListHeaderSearchOptionsInput,
    DomainListHeaderTitleOptionsInput,
} from '../../../core';
import {
    createDomainListBuilder,
} from '../../../core';

enum Direction {
    IN = 'in',
    OUT = 'out',
}

export default defineComponent({
    name: 'TrainStationList',
    props: {
        loadOnSetup: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<TrainStation>>,
            default() {
                return {};
            },
        },
        noMore: {
            type: Boolean,
            default: true,
        },
        footerPagination: {
            type: Boolean,
            default: true,
        },
        headerTitle: {
            type: [Boolean, Object] as PropType<boolean | DomainListHeaderTitleOptionsInput>,
            default: true,
        },
        headerSearch: {
            type: [Boolean, Object] as PropType<boolean | DomainListHeaderSearchOptionsInput>,
            default: true,
        },

        realmId: {
            type: String,
        },
        sourceId: {
            type: String,
            default: undefined,
        },
        target: {
            type: String as PropType<`${DomainType}`>,
            default: DomainType.STATION,
        },
        direction: {
            type: String as PropType<'in' | 'out'>,
            default: Direction.OUT,
        },
    },
    async setup(props, ctx) {
        const refs = toRefs(props);

        const source = computed(() => (refs.target.value === DomainType.STATION ?
            DomainType.TRAIN :
            DomainType.STATION));

        const realmId = realmIdForSocket(refs.realmId);

        const {
            build,
            handleCreated,
            handleUpdated,
            handleDeleted,
        } = createDomainListBuilder<TrainStation>({
            props: refs,
            setup: ctx,
            load: (buildInput) => useAPI().trainStation.getMany(buildInput),
            queryFilter: (q) => {
                let filter : FiltersBuildInput<TrainStation>;

                if (refs.target.value === DomainType.STATION) {
                    filter = {
                        'station.name': q.length > 0 ? `~${q}` : q,
                    };
                } else {
                    filter = {
                        'train.name': q.length > 0 ? `~${q}` : q,
                    };
                }

                if (realmId.value) {
                    if (refs.direction.value === Direction.IN) {
                        filter.station_realm_id = realmId.value;
                    } else {
                        filter.train_realm_id = realmId.value;
                    }
                }

                return filter;
            },
            query: () => {
                if (refs.target.value === DomainType.STATION) {
                    return {
                        include: ['station'],
                    };
                }

                return {
                    include: ['train'],
                };
            },
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: refs.target.value === DomainType.STATION ?
                        'Stations' :
                        'Trains',
                    icon: refs.target.value === DomainType.STATION ?
                        'fa fa-hospital' :
                        'fa-solid fa-train-tram',
                },

                items: {
                    item: {
                        textFn(item) {
                            return h('span', [
                                refs.target.value === DomainType.STATION ?
                                    item.station.name :
                                    item.train.name,
                            ]);
                        },
                    },
                },

                noMore: {
                    textContent: `No more ${refs.target.value} available...`,
                },
            },
        });

        const isSameSocketRoom = (room?: string) => {
            if (realmId.value) {
                switch (refs.direction.value) {
                    case Direction.IN:
                        return room === buildDomainChannelName(DomainSubType.TRAIN_STATION_IN);
                    case Direction.OUT:
                        return room === buildDomainChannelName(DomainSubType.TRAIN_STATION_OUT);
                }
            } else {
                return room === buildSocketTrainStationRoomName();
            }

            return false;
        };

        const isSocketEventForSource = (item: TrainStation) => {
            switch (source.value) {
                case DomainType.STATION:
                    if (typeof refs.sourceId.value === 'undefined') {
                        return refs.realmId.value === item.station_realm_id;
                    }

                    return refs.sourceId.value === item.station_id;
                case DomainType.TRAIN:
                    if (typeof refs.sourceId.value === 'undefined') {
                        return refs.realmId.value === item.train_realm_id;
                    }

                    return refs.sourceId.value === item.train_id;
            }

            return false;
        };

        const handleSocketCreated = (context: SocketServerToClientEventContext<TrainStationEventContext>) => {
            if (
                !isSameSocketRoom(context.meta.roomName) ||
                !isSocketEventForSource(context.data)
            ) return;

            handleCreated(context.data);
        };

        const handleSocketUpdated = (context: SocketServerToClientEventContext<TrainStationEventContext>) => {
            if (
                !isSameSocketRoom(context.meta.roomName) ||
                !isSocketEventForSource(context.data)
            ) return;

            handleUpdated(context.data);
        };

        const handleSocketDeleted = (context: SocketServerToClientEventContext<TrainStationEventContext>) => {
            if (
                !isSameSocketRoom(context.meta.roomName) ||
                !isSocketEventForSource(context.data)
            ) return;

            handleDeleted(context.data);
        };

        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = useSocket().useRealmWorkspace(realmId.value);

        onMounted(() => {
            if (realmId.value) {
                if (refs.direction.value === Direction.IN) {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.TRAIN_STATION_IN,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    ));
                } else {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.TRAIN_STATION_OUT,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    ));
                }
            } else {
                socket.emit(buildDomainEventSubscriptionFullName(
                    DomainType.TRAIN_STATION,
                    DomainEventSubscriptionName.SUBSCRIBE,
                ));
            }

            socket.on(buildDomainEventFullName(
                DomainType.TRAIN_STATION,
                DomainEventName.CREATED,
            ), handleSocketCreated);

            socket.on(buildDomainEventFullName(
                DomainType.TRAIN_STATION,
                DomainEventName.DELETED,
            ), handleSocketDeleted);

            socket.on(buildDomainEventFullName(
                DomainType.TRAIN_STATION,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);
        });

        onUnmounted(() => {
            if (realmId.value) {
                if (refs.direction.value === Direction.IN) {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.TRAIN_STATION_IN,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    ));
                } else {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.TRAIN_STATION_OUT,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    ));
                }
            } else {
                socket.emit(buildDomainEventSubscriptionFullName(
                    DomainType.TRAIN_STATION,
                    DomainEventSubscriptionName.UNSUBSCRIBE,
                ));
            }

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN_STATION,
                DomainEventName.CREATED,
            ), handleSocketCreated);

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN_STATION,
                DomainEventName.DELETED,
            ), handleSocketDeleted);

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN_STATION,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);
        });

        return () => build();
    },
});
