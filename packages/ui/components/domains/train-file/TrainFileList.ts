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

import TrainFileComponent from './TrainFile.vue';

export default defineComponent({
    props: {
        loadOnSetup: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<TrainFile>>,
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

        // todo: include sort

        const {
            build,
            meta,
            handleCreated,
        } = createDomainListBuilder<TrainFile>({
            props: refs,
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
                    textContent: 'No more train files available...',
                },
            },
        });

        const handleSocketCreated = (context: SocketServerToClientEventContext<TrainFileEventContext>) => {
            if (context.meta.roomName !== buildSocketTrainFileRoomName()) return;

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
