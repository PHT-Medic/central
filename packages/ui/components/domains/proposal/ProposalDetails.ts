/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainEventName } from '@authup/core';
import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainEventFullName, buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import type {
    Proposal, ProposalEventContext, SocketClientToServerEvents,
    SocketServerToClientEvents,
} from '@personalhealthtrain/central-common';
import type { Socket } from 'socket.io-client';
import {
    defineComponent, ref, toRef, toRefs,
} from 'vue';
import type { PropType, Ref } from 'vue';
import { useAPI } from '../../../composables/api';
import { useSocket } from '../../../composables/socket';
import { hasNormalizedSlot, normalizeSlot } from '../../../core';

export type ProposalDetailsSlotProps = {
    busy: boolean,
    data: Proposal,
    update(entity: Partial<Proposal>) : Promise<void>,
    updated(entity: Proposal) : void,
    delete() : Promise<void>,
    deleted(entity: Proposal) : void;
    failed(e: Error) : void;
};
export default defineComponent({
    name: 'ProposalDetails',
    props: {
        entity: {
            type: Object as PropType<Proposal>,
        },
        entityId: {
            type: String,
        },
    },
    emits: ['updated', 'failed', 'deleted'],
    async setup(props, { emit, slots }) {
        const refs = toRefs(props);

        const lockId = ref<string | null>(null);
        let entity : Ref<Proposal | undefined> = ref(undefined);
        let error : Error | undefined;

        if (typeof refs.entityId.value !== 'undefined') {
            try {
                entity.value = await useAPI().proposal.getOne(refs.entityId.value);
            } catch (e) {
                if (e instanceof Error) {
                    error = e;
                }
            }
        }

        if (typeof refs.entity.value !== 'undefined') {
            entity = refs.entity;
        }

        if (typeof entity.value === 'undefined') {
            if (hasNormalizedSlot('failed', slots)) {
                return normalizeSlot('failed', { error }, slots);
            }

            return () => h('div', []);
        }

        const handleUpdated = (entity: Proposal) => emit('updated', entity);
        const handleDeleted = (entity: Proposal) => emit('deleted', entity);

        const handleFailed = (error: Error) => emit('failed', error);

        const handleSocketUpdated = (context: ProposalEventContext) => {
            if (
                entity.value &&
                entity.value.id === context.data.id &&
                entity.value.id !== lockId.value
            ) {
                handleUpdated(context.data);
            }
        };

        const handleSocketDeleted = (context: ProposalEventContext) => {
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
        > = useSocket().useRealmWorkspace(entity.value.realm_id);

        onMounted(() => {
            if (entity.value) {
                socket.emit(buildDomainEventSubscriptionFullName(
                    DomainType.PROPOSAL,
                    DomainEventSubscriptionName.SUBSCRIBE,
                ), entity.value.id);

                socket.on(buildDomainEventFullName(
                    DomainType.PROPOSAL,
                    DomainEventName.UPDATED,
                ), handleSocketUpdated);

                socket.on(buildDomainEventFullName(
                    DomainType.PROPOSAL,
                    DomainEventName.DELETED,
                ), handleSocketDeleted);
            }
        });

        onUnmounted(() => {
            if (entity.value) {
                socket.emit(buildDomainEventSubscriptionFullName(
                    DomainType.PROPOSAL,
                    DomainEventSubscriptionName.UNSUBSCRIBE,
                ));

                socket.off(buildDomainEventFullName(
                    DomainType.PROPOSAL,
                    DomainEventName.UPDATED,
                ), handleSocketUpdated);

                socket.off(buildDomainEventFullName(
                    DomainType.PROPOSAL,
                    DomainEventName.DELETED,
                ), handleSocketDeleted);
            }
        });

        const busy = ref(false);

        const update = async (data: Partial<Proposal>) => {
            if (busy.value || !entity.value) {
                return;
            }

            busy.value = true;
            lockId.value = entity.value.id;

            try {
                const response = await useAPI().proposal.update(
                    entity.value.id,
                    data,
                );

                handleUpdated(response);
            } catch (e) {
                if (e instanceof Error) {
                    handleFailed(e);
                }
            } finally {
                busy.value = false;
                lockId.value = null;
            }
        };

        const remove = async () => {
            if (busy.value || !entity.value) {
                return;
            }

            busy.value = true;
            lockId.value = entity.value.id;

            try {
                const response = await useAPI().proposal.delete(
                    entity.value.id,
                );

                handleDeleted(response);
            } catch (e) {
                if (e instanceof Error) {
                    handleFailed(e);
                }
            } finally {
                busy.value = false;
                lockId.value = null;
            }
        };

        if (hasNormalizedSlot('default', slots)) {
            return () => normalizeSlot('default', {
                busy: busy.value,
                data: entity.value as Proposal,
                update,
                updated: handleUpdated,
                delete: remove,
                deleted: handleDeleted,
                failed: handleFailed,
            } satisfies ProposalDetailsSlotProps, slots);
        }

        return () => h('div', []);
    },
});
