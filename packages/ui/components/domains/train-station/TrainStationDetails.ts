/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainEventName } from '@authup/core';
import {
    DomainEventSubscriptionName,
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import type {
    SocketClientToServerEvents,
    SocketServerToClientEventContext,
    SocketServerToClientEvents,
    TrainStation,

    TrainStationEventContext,
} from '@personalhealthtrain/central-common';
import type { FiltersBuildInput, RelationsBuildInput } from 'rapiq';
import type { Socket } from 'socket.io-client';
import { ref, toRefs } from 'vue';
import type { PropType, Ref } from 'vue';
import { defineComponent, useAPI, useSocket } from '#imports';
import { realmIdForSocket } from '../../../composables/domain/realm';
import { hasNormalizedSlot, normalizeSlot } from '../../../core';
import { wrapFnWithBusyState } from '../../../core/busy';
import type { DomainDetailsSlotProps } from '../type';

enum Direction {
    IN = 'in',
    OUT = 'out',
}

enum Target {
    TRAIN = 'train',
    STATION = 'station',
}

export default defineComponent({
    name: 'TrainStationDetails',
    props: {
        entity: {
            type: Object as PropType<TrainStation>,
        },
        entityId: {
            type: String,
        },
        filters: {
            type: Object as PropType<FiltersBuildInput<TrainStation>>,
        },
        direction: {
            type: String as PropType<`${Direction.IN}` | `${Direction.OUT}`>,
        },
        target: {
            type: String as PropType<`${Target.STATION}` | `${Target.TRAIN}`>,
        },
    },
    emits: ['updated', 'deleted', 'failed'],
    async setup(props, { emit, slots }) {
        const refs = toRefs(props);

        const lockId = ref<string | null>(null);
        let entity: Ref<TrainStation | undefined> = ref(undefined);
        let error: Error | undefined;

        if (typeof refs.entity.value !== 'undefined') {
            entity = refs.entity;
        } else if (typeof refs.entityId.value !== 'undefined') {
            try {
                entity.value = await useAPI().trainStation.getOne(refs.entityId.value);
            } catch (e) {
                if (e instanceof Error) {
                    error = e;

                    emit('failed', e);
                }
            }
        } else if (typeof refs.filters.value !== 'undefined') {
            const include = computed<RelationsBuildInput<TrainStation>>(() => {
                if (refs.target.value) {
                    return [refs.target.value];
                }

                return [];
            });

            try {
                const response = await useAPI().trainStation.getMany({
                    page: {
                        limit: 1,
                    },
                    filters: refs.filters.value,
                    include: include.value,
                });

                if (response.data.length > 0) {
                    [entity.value] = response.data;
                }
            } catch (e) {
                if (e instanceof Error) {
                    error = e;

                    emit('failed', e);
                }
            }
        }

        if (typeof entity.value === 'undefined') {
            if (hasNormalizedSlot('failed', slots)) {
                return normalizeSlot('failed', { error }, slots);
            }

            return () => h('div', []);
        }

        if (
            entity.value &&
            refs.target.value &&
            typeof entity.value[refs.target.value] === 'undefined'
        ) {
            if (refs.target.value === Target.TRAIN) {
                entity.value[refs.target.value] = await useAPI().train.getOne(entity.value.train_id);
            } else {
                entity.value[refs.target.value] = await useAPI().station.getOne(entity.value.station_id);
            }
        }

        const handleUpdated = (entity: TrainStation) => emit('updated', entity);
        const handleDeleted = (entity: TrainStation) => emit('deleted', entity);

        const handleFailed = (error: Error) => emit('failed', error);

        const realmId = computed<string | undefined>(() => {
            if (refs.target.value === Target.TRAIN) {
                return entity.value?.train_realm_id;
            }

            if (refs.target.value === Target.STATION) {
                return entity.value?.station_realm_id;
            }

            return undefined;
        });

        const socketRealmId = realmIdForSocket(realmId.value);

        const isEntityForSocketRealm = (item: TrainStation) => {
            if (!socketRealmId.value) {
                return true;
            }

            if (refs.target.value === Target.TRAIN) {
                return socketRealmId.value === item.station_realm_id;
            }

            if (refs.target.value === Target.STATION) {
                return socketRealmId.value === item.train_realm_id;
            }

            return false;
        };

        const matchSocketRoom = (room?: string) => {
            if (refs.direction.value === Direction.IN) {
                return room === buildDomainChannelName(DomainSubType.TRAIN_STATION_IN);
            }

            if (refs.direction.value === Direction.OUT) {
                return room === buildDomainChannelName(DomainSubType.TRAIN_STATION_OUT);
            }

            return room === buildDomainChannelName(DomainType.TRAIN_STATION);
        };

        const handleSocketUpdated = (context: SocketServerToClientEventContext<TrainStationEventContext>) => {
            if (!matchSocketRoom(context.meta.roomName) || !isEntityForSocketRealm(context.data)) {
                return;
            }

            if (
                entity.value &&
                entity.value.id === context.data.id &&
                entity.value.id !== lockId.value
            ) {
                handleUpdated(context.data);
            }
        };

        const handleSocketDeleted = (context: SocketServerToClientEventContext<TrainStationEventContext>) => {
            if (!matchSocketRoom(context.meta.roomName) || !isEntityForSocketRealm(context.data)) {
                return;
            }

            if (
                entity.value &&
                entity.value.id === context.data.id &&
                entity.value.id !== lockId.value
            ) {
                handleDeleted(context.data);
            }
        };

        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = useSocket().useRealmWorkspace(socketRealmId.value);

        onMounted(() => {
            if (entity.value) {
                if (refs.direction.value === Direction.IN) {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.TRAIN_STATION_IN,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    ), entity.value.id);
                } else if (refs.direction.value === Direction.OUT) {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.TRAIN_STATION_OUT,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    ), entity.value.id);
                } else {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainType.TRAIN_STATION,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    ), entity.value.id);
                }

                socket.on(buildDomainEventFullName(
                    DomainType.TRAIN_STATION,
                    DomainEventName.UPDATED,
                ), handleSocketUpdated);

                socket.on(buildDomainEventFullName(
                    DomainType.TRAIN_STATION,
                    DomainEventName.DELETED,
                ), handleSocketDeleted);
            }
        });

        onUnmounted(() => {
            if (entity.value) {
                if (refs.direction.value === Direction.IN) {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.TRAIN_STATION_IN,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    ), entity.value.id);
                } else if (refs.direction.value === Direction.OUT) {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.TRAIN_STATION_OUT,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    ), entity.value.id);
                } else {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainType.TRAIN_STATION,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    ), entity.value.id);
                }

                socket.off(buildDomainEventFullName(
                    DomainType.TRAIN_STATION,
                    DomainEventName.UPDATED,
                ), handleSocketUpdated);

                socket.off(buildDomainEventFullName(
                    DomainType.TRAIN_STATION,
                    DomainEventName.DELETED,
                ), handleSocketDeleted);
            }
        });

        const busy = ref(false);

        const update = wrapFnWithBusyState(busy, async (data: Partial<TrainStation>) => {
            if (!entity.value) {
                return;
            }

            lockId.value = entity.value.id;

            try {
                const response = await useAPI().trainStation.update(
                    entity.value.id,
                    data,
                );

                handleUpdated(response);
            } catch (e) {
                if (e instanceof Error) {
                    handleFailed(e);
                }
            } finally {
                lockId.value = null;
            }
        });

        const remove = wrapFnWithBusyState(busy, async () => {
            if (!entity.value) {
                return;
            }

            lockId.value = entity.value.id;

            try {
                const response = await useAPI().trainStation.delete(
                    entity.value.id,
                );

                handleDeleted(response);
            } catch (e) {
                if (e instanceof Error) {
                    handleFailed(e);
                }
            } finally {
                lockId.value = null;
            }
        });

        if (hasNormalizedSlot('default', slots)) {
            return () => normalizeSlot('default', {
                busy: busy.value,
                data: entity.value as TrainStation,
                update,
                updated: handleUpdated,
                delete: remove,
                deleted: handleDeleted,
                failed: handleFailed,
            } satisfies DomainDetailsSlotProps<TrainStation>, slots);
        }

        if (
            refs.target.value &&
            entity.value[refs.target.value]
        ) {
            if (refs.target.value === Target.TRAIN) {
                return () => h('span', [
                    entity.value?.train.name || entity.value?.train.id,
                ]);
            }
            if (refs.target.value === Target.STATION) {
                return () => h('span', [
                    entity.value?.station.name,
                ]);
            }
        }

        return () => h('span', [
            entity.value?.id,
        ]);
    },
});
