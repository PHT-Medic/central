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
    ProposalStation,
    ProposalStationEventContext,
    SocketClientToServerEvents,
    SocketServerToClientEventContext,

    SocketServerToClientEvents,
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
    PROPOSAL = 'proposal',
    STATION = 'station',
}

export default defineComponent({
    name: 'ProposalStationDetails',
    props: {
        entity: {
            type: Object as PropType<ProposalStation>,
        },
        entityId: {
            type: String,
        },
        filters: {
            type: Object as PropType<FiltersBuildInput<ProposalStation>>,
        },
        direction: {
            type: String as PropType<`${Direction.IN}` | `${Direction.OUT}`>,
        },
        target: {
            type: String as PropType<`${Target.STATION}` | `${Target.PROPOSAL}`>,
        },
    },
    emits: ['updated', 'deleted', 'failed'],
    async setup(props, { emit, slots }) {
        const refs = toRefs(props);

        const lockId = ref<string | null>(null);
        let entity: Ref<ProposalStation | undefined> = ref(undefined);
        let error: Error | undefined;

        if (typeof refs.entity.value !== 'undefined') {
            entity = refs.entity;
        } else if (typeof refs.entityId.value !== 'undefined') {
            try {
                entity.value = await useAPI().proposalStation.getOne(refs.entityId.value);
            } catch (e) {
                if (e instanceof Error) {
                    error = e;

                    emit('failed', e);
                }
            }
        } else if (typeof refs.filters.value !== 'undefined') {
            const include = computed<RelationsBuildInput<ProposalStation>>(() => {
                if (refs.target.value) {
                    return [refs.target.value];
                }

                return [];
            });

            try {
                const response = await useAPI().proposalStation.getMany({
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
            if (refs.target.value === Target.PROPOSAL) {
                entity.value[refs.target.value] = await useAPI().proposal.getOne(entity.value.proposal_id);
            } else {
                entity.value[refs.target.value] = await useAPI().station.getOne(entity.value.station_id);
            }
        }

        const handleUpdated = (entity: ProposalStation) => emit('updated', entity);
        const handleDeleted = (entity: ProposalStation) => emit('deleted', entity);

        const handleFailed = (error: Error) => emit('failed', error);

        const realmId = computed<string | undefined>(() => {
            if (refs.target.value === Target.PROPOSAL) {
                return entity.value?.proposal_realm_id;
            }

            if (refs.target.value === Target.STATION) {
                return entity.value?.station_realm_id;
            }

            return undefined;
        });

        const socketRealmId = realmIdForSocket(realmId.value);

        const isEntityForSocketRealm = (item: ProposalStation) => {
            if (!socketRealmId.value) {
                return true;
            }

            if (refs.target.value === Target.PROPOSAL) {
                return socketRealmId.value === item.station_realm_id;
            }

            if (refs.target.value === Target.STATION) {
                return socketRealmId.value === item.proposal_realm_id;
            }

            return false;
        };

        const matchSocketRoom = (room?: string) => {
            if (refs.direction.value === Direction.IN) {
                return room === buildDomainChannelName(DomainSubType.PROPOSAL_STATION_IN);
            }

            if (refs.direction.value === Direction.OUT) {
                return room === buildDomainChannelName(DomainSubType.PROPOSAL_STATION_OUT);
            }

            return room === buildDomainChannelName(DomainType.PROPOSAL_STATION);
        };

        const handleSocketUpdated = (context: SocketServerToClientEventContext<ProposalStationEventContext>) => {
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

        const handleSocketDeleted = (context: SocketServerToClientEventContext<ProposalStationEventContext>) => {
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
                        DomainSubType.PROPOSAL_STATION_IN,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    ), entity.value.id);
                } else if (refs.direction.value === Direction.OUT) {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.PROPOSAL_STATION_OUT,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    ), entity.value.id);
                } else {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainType.PROPOSAL_STATION,
                        DomainEventSubscriptionName.SUBSCRIBE,
                    ), entity.value.id);
                }

                socket.on(buildDomainEventFullName(
                    DomainType.PROPOSAL_STATION,
                    DomainEventName.UPDATED,
                ), handleSocketUpdated);

                socket.on(buildDomainEventFullName(
                    DomainType.PROPOSAL_STATION,
                    DomainEventName.DELETED,
                ), handleSocketDeleted);
            }
        });

        onUnmounted(() => {
            if (entity.value) {
                if (refs.direction.value === Direction.IN) {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.PROPOSAL_STATION_IN,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    ), entity.value.id);
                } else if (refs.direction.value === Direction.OUT) {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainSubType.PROPOSAL_STATION_OUT,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    ), entity.value.id);
                } else {
                    socket.emit(buildDomainEventSubscriptionFullName(
                        DomainType.PROPOSAL_STATION,
                        DomainEventSubscriptionName.UNSUBSCRIBE,
                    ), entity.value.id);
                }

                socket.off(buildDomainEventFullName(
                    DomainType.PROPOSAL_STATION,
                    DomainEventName.UPDATED,
                ), handleSocketUpdated);

                socket.off(buildDomainEventFullName(
                    DomainType.PROPOSAL_STATION,
                    DomainEventName.DELETED,
                ), handleSocketDeleted);
            }
        });

        const busy = ref(false);

        const update = wrapFnWithBusyState(busy, async (data: Partial<ProposalStation>) => {
            if (!entity.value) {
                return;
            }

            lockId.value = entity.value.id;

            try {
                const response = await useAPI().proposalStation.update(
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
                const response = await useAPI().proposalStation.delete(
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
                data: entity.value as ProposalStation,
                update,
                updated: handleUpdated,
                delete: remove,
                deleted: handleDeleted,
                failed: handleFailed,
            } satisfies DomainDetailsSlotProps<ProposalStation>, slots);
        }

        if (
            refs.target.value &&
            entity.value[refs.target.value]
        ) {
            if (refs.target.value === Target.PROPOSAL) {
                return () => h('div', [
                    entity.value?.proposal.title,
                ]);
            }
            if (refs.target.value === Target.STATION) {
                return () => h('div', [
                    entity.value?.station.name,
                ]);
            }
        }

        return () => h('div', [
            entity.value?.id,
        ]);
    },
});
