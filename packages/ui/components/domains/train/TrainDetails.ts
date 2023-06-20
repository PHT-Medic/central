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
    SocketClientToServerEvents,
    SocketServerToClientEvents,
    Train,
    TrainEventContext,
} from '@personalhealthtrain/central-common';
import type { Socket } from 'socket.io-client';
import {
    defineComponent, ref, toRefs,
} from 'vue';
import type { PropType, Ref } from 'vue';
import { useAPI } from '../../../composables/api';
import { useSocket } from '../../../composables/socket';
import { hasNormalizedSlot, normalizeSlot } from '../../../core';
import { updateObjectProperties } from '../../../utils';

export type TrainDetailsSlotProps = {
    busy: boolean,
    data: Train,
    update(entity: Partial<Train>) : Promise<void>,
    updated(entity: Train) : void,
    delete() : Promise<void>,
    deleted(entity?: Train) : void;
    failed(e: Error) : void;
};
export default defineComponent({
    name: 'TrainDetails',
    props: {
        entity: {
            type: Object as PropType<Train>,
        },
        entityId: {
            type: String,
        },
    },
    emits: ['updated', 'failed', 'deleted'],
    async setup(props, { emit, slots }) {
        const refs = toRefs(props);

        const lockId = ref<string | null>(null);
        let entity : Ref<Train | undefined> = ref(undefined);
        let error : Error | undefined;

        if (typeof refs.entityId.value !== 'undefined') {
            try {
                entity.value = await useAPI().train.getOne(refs.entityId.value);
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

        const handleUpdated = (value: Train) => {
            updateObjectProperties(entity as Ref<Train>, value);
            emit('updated', entity);
        };
        const handleDeleted = (value?: Train) => emit('deleted', value || entity.value);

        const handleFailed = (error: Error) => emit('failed', error);

        const handleSocketUpdated = (context: TrainEventContext) => {
            if (
                entity.value &&
                entity.value.id === context.data.id &&
                entity.value.id !== lockId.value
            ) {
                handleUpdated(context.data);
            }
        };

        const handleSocketDeleted = (context: TrainEventContext) => {
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
                    DomainType.TRAIN,
                    DomainEventSubscriptionName.SUBSCRIBE,
                ), entity.value.id);

                socket.on(buildDomainEventFullName(
                    DomainType.TRAIN,
                    DomainEventName.UPDATED,
                ), handleSocketUpdated);

                socket.on(buildDomainEventFullName(
                    DomainType.TRAIN,
                    DomainEventName.DELETED,
                ), handleSocketDeleted);
            }
        });

        onUnmounted(() => {
            if (entity.value) {
                socket.emit(buildDomainEventSubscriptionFullName(
                    DomainType.TRAIN,
                    DomainEventSubscriptionName.UNSUBSCRIBE,
                ));

                socket.off(buildDomainEventFullName(
                    DomainType.TRAIN,
                    DomainEventName.UPDATED,
                ), handleSocketUpdated);

                socket.off(buildDomainEventFullName(
                    DomainType.TRAIN,
                    DomainEventName.DELETED,
                ), handleSocketDeleted);
            }
        });

        const busy = ref(false);

        const update = async (data: Partial<Train>) => {
            if (busy.value || !entity.value) {
                return;
            }

            busy.value = true;
            lockId.value = entity.value.id;

            try {
                const response = await useAPI().train.update(
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
                const response = await useAPI().train.delete(
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
                data: entity.value as Train,
                update,
                updated: handleUpdated,
                delete: remove,
                deleted: handleDeleted,
                failed: handleFailed,
            } satisfies TrainDetailsSlotProps, slots);
        }

        return () => h('div', []);
    },
});
