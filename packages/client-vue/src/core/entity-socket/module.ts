/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainEventName, REALM_MASTER_NAME } from '@authup/core';
import {
    DomainEventSubscriptionName,
    buildDomainChannelName,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import type {
    DomainEntity,
    DomainEventContext,
    DomainEventSubscriptionFullName,
    DomainInput,
    DomainType,
    SocketServerToClientEventContext,
} from '@personalhealthtrain/central-common';
import {
    computed, isRef, onMounted, onUnmounted, watch,
} from 'vue';
import { storeToRefs } from 'pinia';
import { injectAuthupStore } from '../authup';
import type { EntitySocket, EntitySocketContext } from './type';
import { injectSocketManager } from '../socket';

type DT<T> = T extends DomainEntity<infer U> ? U extends `${DomainType}` ? U : never : never;

export function createEntitySocket<
    A extends DT<DomainEntity<any>>,
    T = DomainEntity<A>,
>(
    ctx: EntitySocketContext<A, T>,
) : EntitySocket {
    const store = injectAuthupStore();
    const storeRefs = storeToRefs(store);

    const realmId = computed(() => {
        if (storeRefs.realmName.value === REALM_MASTER_NAME) {
            return undefined;
        }

        if (isRef(ctx.realmId)) {
            return ctx.realmId.value;
        }

        if (ctx.realmId) {
            return ctx.realmId;
        }

        return storeRefs.realmId.value;
    });

    const targetId = computed(() => (isRef(ctx.targetId) ? ctx.targetId.value : ctx.targetId));

    const lockId = computed(() => (isRef(ctx.lockId) ? ctx.lockId.value : ctx.lockId));

    const processEvent = (event: SocketServerToClientEventContext<DomainEventContext<A>>) : boolean => {
        if (
            ctx.processEvent &&
            !ctx.processEvent(event, realmId.value)
        ) {
            return false;
        }

        const channelName = ctx.buildChannelName ?
            ctx.buildChannelName(targetId.value) :
            buildDomainChannelName(ctx.type, targetId.value);

        if (event.meta.roomName !== channelName) {
            return false;
        }

        if (ctx.target && (!targetId.value || targetId.value !== event.data.id)) {
            return false;
        }

        return event.data.id !== lockId.value;
    };

    const handleCreated = (event: SocketServerToClientEventContext<DomainEventContext<A>>) => {
        if (!processEvent(event)) {
            return;
        }

        if (ctx.onCreated) {
            ctx.onCreated(event.data as T);
        }
    };

    const handleUpdated = (event: SocketServerToClientEventContext<DomainEventContext<A>>) => {
        if (!processEvent(event)) {
            return;
        }

        if (ctx.onUpdated) {
            ctx.onUpdated(event.data as T);
        }
    };
    const handleDeleted = (event: SocketServerToClientEventContext<DomainEventContext<A>>) => {
        if (!processEvent(event)) {
            return;
        }

        if (ctx.onDeleted) {
            ctx.onDeleted(event.data as T);
        }
    };

    const socketManager = injectSocketManager();
    const useSocket = () => socketManager.forRealm(realmId.value);
    let mounted = false;
    const mount = () => {
        if ((ctx.target && !targetId.value) || mounted) {
            return;
        }

        mounted = true;

        const socket = useSocket();

        let event : DomainEventSubscriptionFullName | undefined;
        if (ctx.buildSubscribeEventName) {
            event = ctx.buildSubscribeEventName();
        } else {
            event = buildDomainEventSubscriptionFullName(
                ctx.type as DomainInput,
                DomainEventSubscriptionName.SUBSCRIBE,
            );
        }

        socket.emit(
            event,
            targetId.value,
        );

        if (ctx.onCreated) {
            socket.on(buildDomainEventFullName(
                ctx.type as DomainInput,
                DomainEventName.CREATED,
            ), handleUpdated);
        }

        if (ctx.onUpdated) {
            socket.on(buildDomainEventFullName(
                ctx.type as DomainInput,
                DomainEventName.UPDATED,
            ), handleUpdated);
        }

        if (ctx.onDeleted) {
            socket.on(buildDomainEventFullName(
                ctx.type as DomainInput,
                DomainEventName.DELETED,
            ), handleDeleted);
        }
    };

    const unmount = () => {
        if ((ctx.target && !targetId.value) || !mounted) {
            return;
        }

        mounted = false;

        const socket = useSocket();

        let event : DomainEventSubscriptionFullName | undefined;
        if (ctx.buildUnsubscribeEventName) {
            event = ctx.buildUnsubscribeEventName();
        } else {
            event = buildDomainEventSubscriptionFullName(
                ctx.type as DomainInput,
                DomainEventSubscriptionName.SUBSCRIBE,
            );
        }

        socket.emit(
            event,
            targetId.value,
        );

        if (ctx.onCreated) {
            socket.off(buildDomainEventFullName(
                ctx.type as DomainInput,
                DomainEventName.UPDATED,
            ), handleCreated);
        }

        if (ctx.onUpdated) {
            socket.off(buildDomainEventFullName(
                ctx.type as DomainInput,
                DomainEventName.UPDATED,
            ), handleUpdated);
        }

        if (ctx.onDeleted) {
            socket.off(buildDomainEventFullName(
                ctx.type as DomainInput,
                DomainEventName.DELETED,
            ), handleDeleted);
        }
    };

    onMounted(() => mount());
    onUnmounted(() => unmount());

    watch(targetId, (val, oldValue) => {
        if (val !== oldValue) {
            unmount();
            mount();
        }
    });

    return {
        mount,
        unmount,
    };
}
