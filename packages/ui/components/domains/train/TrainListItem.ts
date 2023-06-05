/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Timeago } from '@vue-layout/timeago';
import { DomainEventName } from '@authup/core';
import type { PropType, VNodeArrayChildren } from 'vue';
import { defineComponent, onMounted, onUnmounted } from 'vue';
import type {
    SocketServerToClientEventContext,
    Train, TrainEventContext,
} from '@personalhealthtrain/central-common';
import {
    DomainEventSubscriptionName,
    DomainType,
    PermissionID,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import { NuxtLink } from '#components';
import { realmIdForSocket } from '../../../composables/domain/realm';
import { useSocket } from '../../../composables/socket';
import { useAuthStore } from '../../../store/auth';
import { updateObjectProperties } from '../../../utils';
import TrainPipeline from './TrainPipeline.vue';
import TrainStationsProgress from '../train-station/TrainStationsProgress.vue';
import TrainName from './TrainName';
import EntityDelete from '../EntityDelete';

export default defineComponent({
    name: 'TrainListItem',
    components: {
        TrainName,
        TrainStationsProgress,
        TrainPipeline,
    },
    props: {
        entity: {
            type: Object as PropType<Train>,
            required: true,
        },
    },
    emits: ['updated', 'deleted', 'failed'],
    setup(props, { emit }) {
        const refs = toRefs(props);
        const socketRealmId = realmIdForSocket(refs.entity.value.realm_id);

        const entity = ref(props.entity);
        let lockId : string | undefined;

        const handleUpdated = (data: Train) => {
            updateObjectProperties(entity, data);

            emit('updated', entity.value);
        };

        const handleDeleted = () => {
            emit('deleted', entity.value);
        };

        const handleFailed = (error: Error) => {
            emit('failed', error);
        };

        const handleSocketUpdated = (context: SocketServerToClientEventContext<TrainEventContext>) => {
            if (
                refs.entity.value.id === context.data.id &&
                context.data.id !== lockId
            ) {
                handleUpdated(context.data);
            }
        };

        const handleSocketDeleted = (context: SocketServerToClientEventContext<TrainEventContext>) => {
            if (
                refs.entity.value.id === context.data.id &&
                context.data.id !== lockId
            ) {
                emit('deleted', context.data);
            }
        };

        const socket = useSocket().useRealmWorkspace(socketRealmId.value);

        onMounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.TRAIN,
                DomainEventSubscriptionName.SUBSCRIBE,
            ), refs.entity.value.id);

            socket.on(buildDomainEventFullName(
                DomainType.TRAIN,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);

            socket.on(buildDomainEventFullName(
                DomainType.TRAIN,
                DomainEventName.DELETED,
            ), handleSocketDeleted);
        });

        onUnmounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.TRAIN,
                DomainEventSubscriptionName.UNSUBSCRIBE,
            ), refs.entity.value.id);

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN,
                DomainEventName.DELETED,
            ), handleSocketDeleted);
        });

        const store = useAuthStore();

        let deleteButton : VNodeArrayChildren = [];

        if (store.has(PermissionID.TRAIN_DROP)) {
            deleteButton = [
                h(EntityDelete, {
                    withText: false,
                    entityId: entity.value.id,
                    entityType: 'train',
                    class: 'btn btn-danger btn-xs ms-1',
                    onDeleted() {
                        handleDeleted();
                    },
                }),
            ];
        }

        const extendedView = ref(false);
        const toggleView = () => {
            extendedView.value = !extendedView.value;
        };

        return () => h(
            'div',
            {
                class: 'train-card',
            },
            [
                h(
                    'div',
                    {
                        class: 'train-card-content align-items-center',
                    },
                    [
                        h('div', [
                            h(
                                TrainName,
                                {
                                    entityId: entity.value.id,
                                    entityName: entity.value.name,
                                    editable: true,
                                    onUpdated(item: Train) {
                                        handleUpdated(item);
                                    },
                                },
                                {
                                    default: (props: any) => {
                                        let trainName : VNodeArrayChildren = [];

                                        if (props.entityName) {
                                            trainName = [
                                                h(
                                                    'span',
                                                    {
                                                        class: 'text-muted ms-1',
                                                    },
                                                    props.entityId,
                                                ),
                                            ];
                                        }

                                        return [
                                            h('i', { class: 'fa-solid fa-train-tram me-1' }),
                                            h(NuxtLink, {
                                                to: `/trains/${props.entityId}`,
                                            }, [
                                                props.nameDisplay,
                                            ]),
                                            trainName,
                                        ];
                                    },
                                },
                            ),
                        ]),
                        h('div', { class: 'ms-auto' }, [
                            h('button', {
                                class: 'btn btn-dark btn-xs',
                                onClick(event: any) {
                                    event.preventDefault();

                                    toggleView();
                                },
                            }, [
                                h('i', {
                                    class: ['fa', {
                                        'fa-chevron-down': !extendedView.value,
                                        'fa-chevron-up': extendedView.value,
                                    }],
                                }),
                            ]),
                            h(NuxtLink, {
                                class: 'btn btn-dark btn-xs ms-1',
                                type: 'button',
                                to: `/trains/${entity.value.id}`,
                            }, [
                                h('i', { class: 'fa fa-bars' }),
                            ]),
                            deleteButton,
                        ]),
                    ],
                ),
                h('hr', {
                    class: 'mt-1 mb-1',
                }),
                h(TrainPipeline, {
                    entity: entity.value,
                    withCommand: extendedView.value,
                    listDirection: extendedView.value ? 'column' : 'row',
                    onUpdated(item: Train) {
                        handleUpdated(item);
                    },
                    onFailed(error: Error) {
                        handleFailed(error);
                    },
                    onDeleted() {
                        handleDeleted();
                    },
                }),
                h(TrainStationsProgress, {
                    class: 'mt-1 mb-1',
                    entity: entity.value.id,
                    elementType: 'progress-bar',
                }),
                h('div', {
                    class: 'train-card-footer',
                }, [
                    h('div', [
                        h('small', [
                            h('span', { class: 'text-muted' }, 'updated'),
                            ' ',
                            h(Timeago, { datetime: entity.value.updated_at }),
                        ]),
                    ]),
                ]),
            ],
        );
    },
});
