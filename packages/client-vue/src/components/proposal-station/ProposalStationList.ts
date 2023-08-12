/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ProposalStation,
} from '@personalhealthtrain/central-common';
import {
    DomainEventSubscriptionName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import type { FiltersBuildInput } from 'rapiq';

import type { PropType, SlotsType, VNodeChild } from 'vue';
import { computed, defineComponent, h } from 'vue';
import type { EntityListSlotsType } from '../../core';
import {
    createEntityList, defineDomainListEvents, defineDomainListProps,
} from '../../core';
import type { DomainDetailsSlotProps } from '../type';
import ProposalStationDetails from './ProposalStationEntity';

enum Direction {
    IN = 'in',
    OUT = 'out',
}

export default defineComponent({
    name: 'ProposalStationList',
    props: {
        ...defineDomainListProps<ProposalStation>(),
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
    slots: Object as SlotsType<EntityListSlotsType<ProposalStation>>,
    emits: defineDomainListEvents<ProposalStation>(),
    async setup(props, ctx) {
        const source = computed(() => (props.target === DomainType.STATION ?
            DomainType.PROPOSAL :
            DomainType.STATION));

        const isSameSocketRoom = (room?: string) => {
            if (props.realmId) {
                switch (props.direction) {
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
                    if (typeof props.sourceId === 'undefined') {
                        return props.realmId === item.station_realm_id;
                    }

                    return props.sourceId === item.station_id;
                case DomainType.PROPOSAL:
                    if (typeof props.sourceId === 'undefined') {
                        return props.realmId === item.proposal_realm_id;
                    }

                    return props.sourceId === item.proposal_id;
            }

            return false;
        };

        const {
            render,
            setDefaults,
        } = createEntityList({
            type: `${DomainType.PROPOSAL_STATION}`,
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
                                DomainSubType.PROPOSAL_STATION_IN,
                                DomainEventSubscriptionName.SUBSCRIBE,
                            );
                        }

                        return buildDomainEventSubscriptionFullName(
                            DomainSubType.PROPOSAL_STATION_OUT,
                            DomainEventSubscriptionName.SUBSCRIBE,
                        );
                    }

                    return buildDomainEventSubscriptionFullName(
                        DomainType.PROPOSAL_STATION,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    );
                },
                buildUnsubscribeEventName() {
                    if (props.realmId) {
                        if (props.direction === Direction.IN) {
                            return buildDomainEventSubscriptionFullName(
                                DomainSubType.PROPOSAL_STATION_IN,
                                DomainEventSubscriptionName.UNSUBSCRIBE,
                            );
                        }

                        return buildDomainEventSubscriptionFullName(
                            DomainSubType.PROPOSAL_STATION_OUT,
                            DomainEventSubscriptionName.UNSUBSCRIBE,
                        );
                    }

                    return buildDomainEventSubscriptionFullName(
                        DomainType.PROPOSAL_STATION,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    );
                },
            },
            queryFilter: (q) => {
                let filter : FiltersBuildInput<ProposalStation>;

                if (props.target === DomainType.STATION) {
                    filter = {
                        'station.name': q.length > 0 ? `~${q}` : q,
                    };
                } else {
                    filter = {
                        'proposal.title': q.length > 0 ? `~${q}` : q,
                    };
                }

                if (props.realmId) {
                    if (props.direction === Direction.IN) {
                        filter.station_realm_id = props.realmId;
                    } else {
                        filter.proposal_realm_id = props.realmId;
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
                    include: ['proposal'],
                };
            },
        });

        setDefaults({
            footerPagination: true,

            headerSearch: true,
            headerTitle: {
                content: props.target === DomainType.STATION ?
                    'Stations' :
                    'Trains',
                icon: props.target === DomainType.STATION ?
                    'fa fa-hospital' :
                    'fa-solid fa-file',
            },

            item: {
                content(
                    item,
                    itemProps,
                    slotContent,
                ) {
                    return h(ProposalStationDetails, {
                        entity: item,
                        direction: props.direction,
                        target: props.target,
                        onUpdated: itemProps.updated,
                        onDeleted: itemProps.deleted,
                        onFailed: itemProps.failed,
                    }, {
                        default: (slotProps: DomainDetailsSlotProps<ProposalStation>) => {
                            if (slotContent.slot) {
                                return slotContent.slot;
                            }

                            let text : VNodeChild | undefined;

                            if (
                                props.target === DomainType.STATION &&
                                slotProps.data.station
                            ) {
                                text = h('div', [slotProps.data.station.name]);
                            } else if (
                                props.target === DomainType.PROPOSAL &&
                                slotProps.data.proposal
                            ) {
                                text = h('div', [slotProps.data.proposal.title]);
                            } else {
                                text = h('div', [slotProps.data.id]);
                            }

                            return [
                                slotContent.icon,
                                text,
                                slotContent.actions,
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
