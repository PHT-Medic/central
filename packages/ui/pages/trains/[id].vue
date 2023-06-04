<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import {
    DomainEventName,
    DomainEventSubscriptionName,
    DomainType,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import { useToast } from 'bootstrap-vue-next';
import { isClientErrorWithStatusCode } from 'hapic';
import type { Ref } from 'vue';
import { onMounted, onUnmounted } from 'vue';
import type {
    SocketServerToClientEventContext, Train,
    TrainEventContext,
} from '@personalhealthtrain/central-common';
import { definePageMeta, ref } from '#imports';
import {
    createError, defineNuxtComponent, navigateTo, useRoute,
} from '#app';
import DomainEntityNav from '../../components/DomainEntityNav';
import { useAPI } from '../../composables/api';
import { useSocket } from '../../composables/socket';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';
import TrainName from '../../components/domains/train/TrainName';

export default defineNuxtComponent({
    components: { DomainEntityNav, TrainName },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const toast = useToast();

        let entity : Ref<Train>;

        try {
            const response = await useAPI().train.getOne(useRoute().params.id as string);
            entity = ref(response);
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 404)) {
                await navigateTo({
                    path: '/trains',
                });
            }

            throw createError({});
        }

        const handleUpdated = (data: Train) => {
            const keys = Object.keys(data);
            for (let i = 0; i < keys.length; i++) {
                entity.value[keys[i]] = data[keys[i]];
            }
        };

        const handleFailed = (e: Error) => {
            toast.show({ body: e.message }, {
                pos: 'top-center',
            });
        };

        const handleSocketUpdated = (context: SocketServerToClientEventContext<TrainEventContext>) => {
            if (
                entity.value.id !== context.data.id ||
                context.meta.roomId !== entity.value.id
            ) return;

            handleUpdated(context.data);
        };
        const handleSocketDeleted = (context: SocketServerToClientEventContext<TrainEventContext>) => {
            if (
                entity.value.id !== context.data.id ||
                context.meta.roomId !== entity.value.id
            ) return;

            navigateTo('/trains');
        };

        const socket = useSocket().useRealmWorkspace(entity.value.realm_id);

        onMounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.TRAIN,
                DomainEventSubscriptionName.SUBSCRIBE,
            ));

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
            ));

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);

            socket.off(buildDomainEventFullName(
                DomainType.TRAIN,
                DomainEventName.DELETED,
            ), handleSocketDeleted);
        });

        const tabs = [
            { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
            { name: 'Setup', icon: 'fa fa-wrench', urlSuffix: '/setup' },
        ];

        return {
            tabs,
            entity,
            handleFailed,
            handleUpdated,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            🚊 Train
            <span class="sub-title">
                <train-name
                    :entity-id="entity.id"
                    :entity-name="entity.name"
                />
            </span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <div class="flex-wrap flex-row d-flex align-items-center">
                        <DomainEntityNav
                            :prev-link="true"
                            :items="tabs"
                            :path="'/trains/' + entity.id"
                        />
                    </div>
                </div>
            </div>
        </div>

        <NuxtPage
            :entity="entity"
            @updated="handleUpdated"
            @failed="handleFailed"
        />
    </div>
</template>
