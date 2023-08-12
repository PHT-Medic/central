<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { createEntityManager } from '@personalhealthtrain/client-vue';
import { useToast } from 'bootstrap-vue-next';
import type {
    Station,
} from '@personalhealthtrain/central-common';
import {
    DomainType,
} from '@personalhealthtrain/central-common';
import {
    useRoute,
} from '#imports';
import { createError, defineNuxtComponent, navigateTo } from '#app';

export default defineNuxtComponent({
    async setup() {
        const toast = useToast();

        const route = useRoute();

        const manager = createEntityManager({
            type: `${DomainType.STATION}`,
            props: {
                entityId: route.params.id as string,
            },
            onFailed(e) {
                if (toast) {
                    toast.show({ body: e.message }, {
                        pos: 'top-center',
                    });
                }
            },
            onUpdated() {
                if (toast) {
                    toast.success({ body: 'The station was successfully updated.' });
                }
            },
        });

        await manager.resolve({
            query: {
                fields: [
                    '+registry_id',
                    '+registry_project_id',
                    '+public_key',
                    '+email',
                    '+external_name',
                ],
            },
        });

        if (!manager.entity.value) {
            await navigateTo({ path: '/admin/stations' });
            throw createError({});
        }

        const tabs = [
            { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
            { name: 'Robot', icon: 'fas fa-robot', urlSuffix: 'robot' },
            { name: 'Registry', icon: 'fab fa-docker', urlSuffix: 'registry' },
        ];

        return {
            tabs,
            entity: manager.entity.value as Station,
            handleUpdated: manager.updated,
            handleFailed: manager.failed,
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
