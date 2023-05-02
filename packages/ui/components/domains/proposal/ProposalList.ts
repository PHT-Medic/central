/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    Proposal, ProposalEventContext,
    SocketServerToClientEventContext,
} from '@personalhealthtrain/central-common';
import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
    buildSocketProposalRoomName,
} from '@personalhealthtrain/central-common';
import { storeToRefs } from 'pinia';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { BuildInput } from 'rapiq';
import { DomainEventName, REALM_MASTER_NAME } from '@authup/core';
import { realmIdForSocket } from '../../../composables/domain/realm';
import { useSocket } from '../../../composables/socket';
import type {
    DomainListHeaderSearchOptionsInput,
    DomainListHeaderTitleOptionsInput,
} from '../../../core';
import {
    createDomainListBuilder,
} from '../../../core';
import { useAuthStore } from '../../../store/auth';

export default defineComponent({
    props: {
        loadOnSetup: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<Proposal>>,
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
            default: undefined,
        },
    },
    setup(props, ctx) {
        // todo: add default query for sort: { path: 'ASC' }
        // todo: add filter title
        const refs = toRefs(props);

        const socketRealmId = realmIdForSocket(refs.realmId.value);

        const { build, meta, handleCreated } = createDomainListBuilder<Proposal>({
            props: refs,
            setup: ctx,
            load: (buildInput) => useAPI().proposal.getMany(buildInput),
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Proposals',
                    icon: 'fa fa-scroll',
                },

                noMore: {
                    textContent: 'No more proposals available...',
                },
            },
        });

        const handleSocketCreated = (context: SocketServerToClientEventContext<ProposalEventContext>) => {
            if (context.meta.roomName !== buildSocketProposalRoomName()) return;

            // todo: append item at beginning as well end of list... ^^
            if (
                refs.query.value.sort &&
                (refs.query.value.sort.title === 'DESC' || refs.query.value.sort.updated_at === 'DESC') &&
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
