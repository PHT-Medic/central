/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    Proposal,
    ProposalEventContext,
    SocketServerToClientEventContext,
} from '@personalhealthtrain/central-common';
import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainChannelName,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import { DomainEventName } from '@authup/core';
import { realmIdForSocket } from '../../../composables/domain/realm';
import { useSocket } from '../../../composables/socket';
import type {
    DomainListSlotsType,
} from '../../../core';
import {
    createDomainListBuilder,
    defineDomainListEvents,
    defineDomainListProps,
    isQuerySortedDescByDate,
} from '../../../core';

export default defineComponent({
    props: {
        ...defineDomainListProps<Proposal>(),
        realmId: {
            type: String,
            default: undefined,
        },
    },
    slots: Object as SlotsType<DomainListSlotsType<Proposal>>,
    emits: defineDomainListEvents<Proposal>(),
    setup(props, ctx) {
        const refs = toRefs(props);

        const socketRealmId = realmIdForSocket(refs.realmId.value);

        const { build, meta, handleCreated } = createDomainListBuilder<Proposal>({
            props,
            setup: ctx,
            load: (buildInput) => useAPI().proposal.getMany(buildInput),
            queryFilter: (q) => ({
                title: q.length > 0 ? `~${q}` : q,
            }),
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Proposals',
                    icon: 'fa fa-scroll',
                },

                noMore: {
                    content: 'No more proposals available...',
                },
            },
        });

        const handleSocketCreated = (context: SocketServerToClientEventContext<ProposalEventContext>) => {
            if (context.meta.roomName !== buildDomainChannelName(DomainType.PROPOSAL)) return;

            if (
                refs.query.value.sort &&
                isQuerySortedDescByDate(refs.query.value.sort) &&
                meta.value.offset === 0
            ) {
                handleCreated(context.data);
                return;
            }

            if (meta.value.total < meta.value.limit) {
                handleCreated(context.data);
            }
        };

        const socket = useSocket().useRealmWorkspace(socketRealmId.value);

        onMounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.PROPOSAL,
                DomainEventSubscriptionName.SUBSCRIBE,
            ));

            socket.on(buildDomainEventFullName(
                DomainType.PROPOSAL,
                DomainEventName.CREATED,
            ), handleSocketCreated);
        });

        onUnmounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.PROPOSAL,
                DomainEventSubscriptionName.UNSUBSCRIBE,
            ));

            socket.off(buildDomainEventFullName(
                DomainType.PROPOSAL,
                DomainEventName.CREATED,
            ), handleSocketCreated);
        });

        return () => build();
    },
});
