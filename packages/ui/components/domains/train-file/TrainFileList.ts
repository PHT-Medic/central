/*
* Copyright (c) 2022.
* Author Peter Placzek (tada5hi)
* For the full copyright and license information,
* view the LICENSE file that was distributed with this source code.
*/
import type {
    SocketServerToClientEventContext,
    TrainFile,
    TrainFileEventContext,
} from '@personalhealthtrain/central-common';
import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
    buildSocketTrainFileRoomName,
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
        ...defineDomainListProps<TrainFile>(),
        realmId: {
            type: String,
            default: undefined,
        },
    },
    slots: Object as SlotsType<DomainListSlotsType<TrainFile>>,
    emits: defineDomainListEvents<TrainFile>(),
    setup(props, ctx) {
        const refs = toRefs(props);

        const socketRealmId = realmIdForSocket(refs.realmId.value);

        // todo: include sort

        const {
            build,
            meta,
            handleCreated,
        } = createDomainListBuilder<TrainFile>({
            props,
            setup: ctx,
            load: (buildInput) => useAPI().trainFile.getMany(buildInput),
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Train Files',
                    icon: 'fa-train-tram',
                },

                noMore: {
                    content: 'No more train files available...',
                },
            },
        });

        const handleSocketCreated = (context: SocketServerToClientEventContext<TrainFileEventContext>) => {
            if (context.meta.roomName !== buildSocketTrainFileRoomName()) return;

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
                DomainType.TRAIN_FILE,
                DomainEventSubscriptionName.SUBSCRIBE,
            ));

            socket.on(buildDomainEventFullName(
                DomainType.TRAIN_FILE,
                DomainEventName.CREATED,
            ), handleSocketCreated);
        });

        onUnmounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.TRAIN_FILE,
                DomainEventSubscriptionName.UNSUBSCRIBE,
            ));

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN_FILE,
                DomainEventName.CREATED,
            ), handleSocketCreated);
        });

        return () => build();
    },
});
