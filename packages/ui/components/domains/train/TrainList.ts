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
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
    buildSocketTrainRoomName,
} from '@personalhealthtrain/central-common';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { BuildInput } from 'rapiq';
import { DomainEventName } from '@authup/core';
import { realmIdForSocket } from '../../../composables/domain/realm';
import { useSocket } from '../../../composables/socket';
import type {
    DomainListHeaderSearchOptionsInput,
    DomainListHeaderTitleOptionsInput,
} from '../../../core';
import {
    createDomainListBuilder,
} from '../../../core';
import TrainListItem from './TrainListItem';

export default defineComponent({
    props: {
        loadOnSetup: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<Train>>,
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
        const refs = toRefs(props);

        const socketRealmId = realmIdForSocket(refs.realmId.value);

        const {
            build,
            meta,
            handleCreated,
            handleDeleted,
            handleUpdated,
        } = createDomainListBuilder<Train>({
            props: refs,
            setup: ctx,
            load: (buildInput) => useAPI().train.getMany(buildInput),
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Trains',
                    icon: 'fa-train-tram',
                },

                items: {
                    item: {
                        textFn: (item) => h(TrainListItem, {
                            entity: item,
                            onDeleted: handleDeleted,
                            onUpdated: handleUpdated,
                            onCreated: handleCreated,
                        }),
                    },
                },

                noMore: {
                    textContent: 'No more trains available...',
                },
            },
        });

        const handleSocketCreated = (context: SocketServerToClientEventContext<TrainEventContext>) => {
            if (context.meta.roomName !== buildSocketTrainRoomName()) return;

            // todo: append item at beginning as well end of list... ^^
            if (
                refs.query.value.sort &&
                (refs.query.value.sort.created_at === 'DESC' || refs.query.value.sort.updated_at === 'DESC') &&
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
