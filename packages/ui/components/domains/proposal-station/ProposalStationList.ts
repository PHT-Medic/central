/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainEventName } from '@authup/core';
import type {
    ProposalStation,
    ProposalStationEventContext,
    SocketServerToClientEventContext,
} from '@personalhealthtrain/central-common';
import {
    DomainEventSubscriptionName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import type { BuildInput, FiltersBuildInput } from 'rapiq';

import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import { realmIdForSocket } from '../../../composables/domain/realm';
import { useSocket } from '../../../composables/socket';
import type { DomainListHeaderSearchOptionsInput, DomainListHeaderTitleOptionsInput } from '../../../core';
import { createDomainListBuilder } from '../../../core';
import ProposalStationDetails from './ProposalStationDetails';

enum Direction {
    IN = 'in',
    OUT = 'out',
}

export default defineComponent({
    name: 'ProposalStationList',
    props: {
        loadOnSetup: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<ProposalStation>>,
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
            type: String as PropType<'station' | 'proposal'>,
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
            DomainType.PROPOSAL :
            DomainType.STATION));

        const realmId = realmIdForSocket(refs.realmId);

        const {
            build,
            handleCreated,
        } = createDomainListBuilder<ProposalStation>({
            props: refs,
            setup: ctx,
            load: (buildInput) => useAPI().proposalStation.getMany(buildInput),
            queryFilter: (q) => {
                let filter : FiltersBuildInput<ProposalStation>;

                if (refs.target.value === DomainType.STATION) {
                    filter = {
                        'station.name': q.length > 0 ? `~${q}` : q,
                    };
                } else {
                    filter = {
                        'proposal.title': q.length > 0 ? `~${q}` : q,
                    };
                }

                if (realmId.value) {
                    if (refs.direction.value === Direction.IN) {
                        filter.station_realm_id = realmId.value;
                    } else {
                        filter.proposal_realm_id = realmId.value;
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
                    include: ['proposal'],
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
                        'fa-solid fa-file',
                },

                items: {
                    item: {
                        fn(
                            item,
                            itemProps,
                            slotContent,
                        ) {
                            const slots : Record<string, any> = {};
                            if (slotContent) {
                                slots.default = slotContent;
                            }

                            return h(ProposalStationDetails, {
                                entity: item,
                                direction: refs.direction.value,
                                target: refs.target.value,
                                onUpdated: itemProps.updated,
                                onDeleted: itemProps.deleted,
                                onFailed: itemProps.failed,
                            }, slots);
                        },
                        textFn(item) {
                            if (
                                refs.target.value === DomainType.STATION &&
                                item.station
                            ) {
                                return h('span', [item.station.name]);
                            }

                            if (
                                refs.target.value === DomainType.PROPOSAL &&
                                item.proposal
                            ) {
                                return h('span', [item.proposal.title]);
                            }

                            return h('span', [item.id]);
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
                        return room === buildDomainChannelName(DomainSubType.PROPOSAL_STATION_IN);
                    case Direction.OUT:
                        return room === buildDomainChannelName(DomainSubType.PROPOSAL_STATION_OUT);
                }
            } else {
                return room === buildDomainChannelName(DomainType.PROPOSAL_STATION);
            }

            return false;
        };

        const isSocketEventForSource = (item: ProposalStation) => {
            switch (source.value) {
                case DomainType.STATION:
                    if (typeof refs.sourceId.value === 'undefined') {
                        return refs.realmId.value === item.station_realm_id;
                    }

                    return refs.sourceId.value === item.station_id;
                case DomainType.PROPOSAL:
                    if (typeof refs.sourceId.value === 'undefined') {
                        return refs.realmId.value === item.proposal_realm_id;
                    }

                    return refs.sourceId.value === item.proposal_id;
            }

            return false;
        };

        const handleSocketCreated = (context: SocketServerToClientEventContext<ProposalStationEventContext>) => {
            if (
                !isSameSocketRoom(context.meta.roomName) ||
                !isSocketEventForSource(context.data)
            ) return;

            handleCreated(context.data);
        };

        const socket = useSocket().useRealmWorkspace(realmId.value);

        onMounted(() => {
            if (realmId.value) {
                if (refs.direction.value === Direction.IN) {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.PROPOSAL_STATION_IN,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    ));
                } else {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.PROPOSAL_STATION_OUT,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    ));
                }
            } else {
                socket.emit(buildDomainEventSubscriptionFullName(
                    DomainType.PROPOSAL_STATION,
                    DomainEventSubscriptionName.SUBSCRIBE,
                ));
            }

            socket.on(buildDomainEventFullName(
                DomainType.PROPOSAL_STATION,
                DomainEventName.CREATED,
            ), handleSocketCreated);
        });

        onUnmounted(() => {
            if (realmId.value) {
                if (refs.direction.value === Direction.IN) {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.PROPOSAL_STATION_IN,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    ));
                } else {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.PROPOSAL_STATION_OUT,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    ));
                }
            } else {
                socket.emit(buildDomainEventSubscriptionFullName(
                    DomainType.PROPOSAL_STATION,
                    DomainEventSubscriptionName.UNSUBSCRIBE,
                ));
            }

            socket.off(buildDomainEventFullName(
                DomainType.PROPOSAL_STATION,
                DomainEventName.CREATED,
            ), handleSocketCreated);
        });

        return () => build();
    },
});
