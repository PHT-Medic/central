/*
* Copyright (c) 2022.
* Author Peter Placzek (tada5hi)
* For the full copyright and license information,
* view the LICENSE file that was distributed with this source code.
*/
import type {
    SocketServerToClientEventContext,
    Train, TrainEventContext,
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
import TrainItem from './TrainItem';

export default defineComponent({
    props: {
        ...defineDomainListProps<Train>(),
        realmId: {
            type: String,
            default: undefined,
        },
    },
    slots: Object as SlotsType<DomainListSlotsType<Train>>,
    emits: defineDomainListEvents<Train>(),
    setup(props, ctx) {
        const refs = toRefs(props);

        const socketRealmId = realmIdForSocket(refs.realmId.value);

        const {
            build,
            meta,
            handleCreated,
            handleDeleted,
            handleUpdated,
        } = createDomainListBuilder<Train>({
            props,
            setup: ctx,
            load: (buildInput) => useAPI().train.getMany(buildInput),
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Trains',
                    icon: 'fa fa-train-tram',
                },

                item: {
                    content(item) {
                        return h(TrainItem, {
                            entity: item,
                            onDeleted: handleDeleted,
                            onUpdated: handleUpdated,
                        });
                    },
                },

                noMore: {
                    content: 'No more trains available...',
                },
            },
        });

        const handleSocketCreated = (context: SocketServerToClientEventContext<TrainEventContext>) => {
            if (context.meta.roomName !== buildDomainChannelName(DomainType.TRAIN)) return;

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
                DomainType.TRAIN,
                DomainEventSubscriptionName.SUBSCRIBE,
            ));

            socket.on(buildDomainEventFullName(
                DomainType.TRAIN,
                DomainEventName.CREATED,
            ), handleSocketCreated);
        });

        onUnmounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.TRAIN,
                DomainEventSubscriptionName.UNSUBSCRIBE,
            ));

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN,
                DomainEventName.CREATED,
            ), handleSocketCreated);
        });

        return () => build();
    },
});
