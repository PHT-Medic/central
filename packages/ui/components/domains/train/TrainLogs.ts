/*
* Copyright (c) 2022.
* Author Peter Placzek (tada5hi)
* For the full copyright and license information,
* view the LICENSE file that was distributed with this source code.
*/
import { DomainEventName } from '@authup/core';
import type {
    SocketServerToClientEventContext,
    TrainLog, TrainLogEventContext,
} from '@personalhealthtrain/central-common';
import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainChannelName,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import { defineComponent, ref, toRefs } from 'vue';
import { useAPI, useSocket } from '#imports';
import { realmIdForSocket } from '../../../composables/domain/realm';
import { createDomainListBuilder } from '../../../core';
import TrainLogComponent from './TrainLog.vue';

export default defineComponent({
    name: 'TrainLogs',
    props: {
        entityId: {
            type: String,
            required: true,
        },
        realmId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, ctx) {
        const refs = toRefs(props);

        const socketRealmId = realmIdForSocket(refs.realmId.value);

        const {
            build,
            meta,
            handleCreated,
        } = createDomainListBuilder<TrainLog>({
            props: {},
            setup: ctx,
            load: (buildInput) => useAPI().trainLog.getMany(buildInput),
            loadAll: true,
            query: {
                filter: {
                    train_id: refs.entityId.value,
                },
                sort: {
                    created_at: 'ASC',
                },
            },
            queryFilter: (q) => ({
                title: q.length > 0 ? `~${q}` : q,
            }),
            defaults: {
                footerPagination: false,

                headerSearch: false,
                headerTitle: false,

                noMore: {
                    class: { presets: { bootstrap: false }, value: 'list-no-more' },
                    textContent: 'No more logs available...',
                },
                items: {
                    item: {
                        fn(item, slotProps) {
                            return h(
                                TrainLogComponent,
                                {
                                    entity: item,
                                    index: slotProps.index,
                                    onDeleted() {
                                        slotProps.deleted();
                                    },
                                    onUpdated(e: TrainLog) {
                                        slotProps.updated(e);
                                    },
                                },
                            );
                        },
                    },
                },
            },
        });

        const rootNode = ref<null | HTMLElement>(null);

        const scrollToLastLine = () => {
            if (!rootNode.value) {
                return;
            }

            const el = rootNode.value.getElementsByClassName(`line-${meta.value.total}`)[0];

            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        };

        const shouldSkipEvent = (
            context: SocketServerToClientEventContext<TrainLogEventContext>,
        ) => context.meta.roomName !== buildDomainChannelName(DomainType.TRAIN_LOG) ||
                context.data.train_id !== refs.entityId.value;

        const handleSocketCreated = (context: SocketServerToClientEventContext<TrainLogEventContext>) => {
            if (shouldSkipEvent(context)) return;

            handleCreated(context.data);

            scrollToLastLine();
        };

        const socket = useSocket().useRealmWorkspace(socketRealmId.value);

        onMounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.TRAIN_LOG,
                DomainEventSubscriptionName.SUBSCRIBE,
            ));

            socket.on(buildDomainEventFullName(
                DomainType.TRAIN_LOG,
                DomainEventName.CREATED,
            ), handleSocketCreated);
        });

        onUnmounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.TRAIN_LOG,
                DomainEventSubscriptionName.UNSUBSCRIBE,
            ));

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN_LOG,
                DomainEventName.CREATED,
            ), handleSocketCreated);
        });

        return () => h('div', {
            ref: rootNode,
            class: 'log-container',
        }, [
            h('div', {
                class: 'log-body',
            }, build()),
        ]);
    },
});
