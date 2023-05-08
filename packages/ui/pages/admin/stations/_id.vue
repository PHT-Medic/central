<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { DomainEventName } from '@authup/core';
import { useToast } from 'bootstrap-vue-next';
import type {
    SocketServerToClientEventContext,
    Station, StationEventContext,
} from '@personalhealthtrain/central-common';
import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import type { Ref } from 'vue';
import { onMounted, onUnmounted, ref } from 'vue';
import {
    updateObjectProperties, useAPI, useRoute, useSocket,
} from '#imports';
import { createError, defineNuxtComponent, navigateTo } from '#app';
import StationForm from '../../../components/domains/station/StationForm';

export default defineNuxtComponent({
    components: { StationForm },
    async setup() {
        let entity : Ref<Station>;

        const toast = useToast();
        const route = useRoute();

        try {
            const { data: stations } = await useAPI().station.getMany({
                filter: {
                    id: route.params.id as string,
                },
                fields: [
                    '+registry_id',
                    '+registry_project_id',
                    '+public_key',
                    '+email',
                    '+external_name',
                ],
            });

            const station = stations.pop();
            if (!station) {
                throw new Error();
            }

            entity = ref(station);
        } catch (e) {
            await navigateTo({ path: '/admin/stations' });
            throw createError({});
        }

        const handleUpdated = (
            item: Station,
            options?: {displayMessage?: boolean},
        ) => {
            options = options || {};
            options.displayMessage = options.displayMessage ?? true;

            updateObjectProperties(entity, item);

            if (options.displayMessage) {
                toast.success({ body: 'The station was successfully updated.' });
            }
        };

        const handleFailed = (e: Error) => {
            toast.danger({ body: e.message });
        };

        const handleSocketUpdated = (context: SocketServerToClientEventContext<StationEventContext>) => {
            if (
                entity.value.id !== context.data.id ||
                context.meta.roomId !== entity.value.id
            ) return;

            handleUpdated(context.data, { displayMessage: false });
        };

        const socket = useSocket().useRealmWorkspace(entity.value.realm_id);

        onMounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.STATION,
                DomainEventSubscriptionName.SUBSCRIBE,
            ), entity.value.id);

            socket.on(buildDomainEventFullName(
                DomainType.STATION,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);
        });

        onUnmounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.STATION,
                DomainEventSubscriptionName.UNSUBSCRIBE,
            ), entity.value.id);

            socket.off(buildDomainEventFullName(
                DomainType.STATION,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);
        });

        const tabs = [
            { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
        ];

        return {
            tabs,
            entity,
            handleUpdated,
            handleFailed,
        };
    },
});
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            {{ entity.name }} <span class="sub-title">Details</span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="flex-wrap flex-row d-flex">
                <DomainEntityNav
                    :items="tabs"
                    :path="'/admin/stations/' + entity.id"
                    :prev-link="true"
                />
            </div>
        </div>
        <NuxtPage
            :entity="entity"
            @updated="handleUpdated"
            @failed="handleFailed"
        />
    </div>
</template>
