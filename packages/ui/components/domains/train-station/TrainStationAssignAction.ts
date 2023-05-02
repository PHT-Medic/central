/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainEventName } from '@authup/core';
import { defineComponent } from 'vue';
import type {
    SocketServerToClientEventContext,
    TrainStation, TrainStationEventContext,
} from '@personalhealthtrain/central-common';
import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import { useSocket } from '../../../composables/socket';

export default defineComponent({
    name: 'TrainStationAssignAction',
    props: {
        trainId: {
            type: String,
            required: true,
        },
        stationId: {
            type: String,
            required: true,
        },
        realmId: String,
    },
    emits: ['created', 'deleted', 'failed'],
    async setup(props, { emit }) {
        const busy = ref(false);
        const item = ref<null | TrainStation>(null);

        try {
            const response = await useAPI().trainStation.getMany({
                filters: {
                    train_id: props.trainId,
                    station_id: props.stationId,
                },
                page: {
                    limit: 1,
                },
            });

            if (response.meta.total === 1) {
                // eslint-disable-next-line prefer-destructuring
                item.value = response.data[0];
            }
        } catch (e) {
            // ...
        }

        const socket = useSocket().useRealmWorkspace(props.realmId);

        const handleSocketCreated = (context: SocketServerToClientEventContext<TrainStationEventContext>) => {
            if (context.data.train_id === props.trainId) {
                item.value = context.data;
                emit('created', context.data);
            }
        };

        const handleSocketDeleted = (context: SocketServerToClientEventContext<TrainStationEventContext>) => {
            if (item.value && item.value.id === context.data.id) {
                item.value = null;

                emit('deleted', context.data);
            }
        };

        onMounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.TRAIN_STATION,
                DomainEventSubscriptionName.SUBSCRIBE,
            ));

            socket.on(buildDomainEventFullName(
                DomainType.TRAIN_STATION,
                DomainEventName.CREATED,
            ), handleSocketCreated);

            socket.on(buildDomainEventFullName(
                DomainType.TRAIN_STATION,
                DomainEventName.DELETED,
            ), handleSocketDeleted);
        });

        onUnmounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.TRAIN_STATION,
                DomainEventSubscriptionName.UNSUBSCRIBE,
            ));

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN_STATION,
                DomainEventName.CREATED,
            ), handleSocketCreated);

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN_STATION,
                DomainEventName.DELETED,
            ), handleSocketDeleted);
        });

        const add = async () => {
            if (busy.value || item.value) return;

            busy.value = true;

            try {
                const response = await useAPI().trainStation.create({
                    train_id: props.trainId,
                    station_id: props.stationId,
                });

                item.value = response;

                emit('created', response);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }

            busy.value = false;
        };

        const drop = async () => {
            if (busy.value || !item.value) return;

            busy.value = true;

            try {
                const userRole = await useAPI().trainStation.delete(item.value.id);

                item.value = null;

                emit('deleted', userRole);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }

            busy.value = false;
        };

        return () => h('button', {
            class: ['btn btn-xs', {
                'btn-success': !item.value,
                'btn-danger': item.value,
            }],
            onClick($event: any) {
                $event.preventDefault();

                if (item.value) {
                    return drop();
                }

                return add();
            },
        }, [
            h('i', {
                class: ['fa', {
                    'fa-plus': !item.value,
                    'fa-trash': item.value,
                }],
            }),
        ]);
    },
});
