<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { DomainType, Ecosystem, PermissionID } from '@personalhealthtrain/central-common';
import { createEntityManager } from '@personalhealthtrain/client-vue';
import { useToast } from 'bootstrap-vue-next';
import { computed } from 'vue';
import {
    createError,
    definePageMeta, navigateTo, useRoute,
} from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineNuxtComponent({
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.REGISTRY_MANAGE,
            ],
        });

        const toast = useToast();
        const route = useRoute();

        const manager = createEntityManager({
            type: `${DomainType.REGISTRY}`,
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
                    toast.success({ body: 'The registry was successfully updated.' });
                }
            },
            onDeleted() {
                if (toast) {
                    toast.success({ body: 'The registry was successfully deleted.' });
                }

                return navigateTo('/admin/registries');
            },
        });

        await manager.resolve({
            query: {
                fields: ['+account_secret'],
            },
        });

        if (!manager.data.value) {
            await navigateTo({ path: '/admin/services/registries' });
            throw createError({});
        }

        const tabs = computed(() => [
            {
                name: 'General', icon: 'fas fa-bars', urlSuffix: '',
            },
            ...(
                manager.data.value &&
                manager.data.value.ecosystem === Ecosystem.DEFAULT ?
                    [
                        {
                            name: 'Cleanup', icon: 'fa-solid fa-hands-bubbles', urlSuffix: 'cleanup',
                        },
                        {
                            name: 'Setup', icon: 'fa-solid fa-cog', urlSuffix: 'setup',
                        },
                    ] : []
            ),
            {
                name: 'Projects',
                icon: 'fa-solid fa-diagram-project',
                urlSuffix: 'projects',
                components: [
                    {
                        name: 'overview',
                        urlSuffix: '',
                        icon: 'fa fa-bars',
                    },
                    {
                        name: 'add',
                        urlSuffix: '/add',
                        icon: 'fa fa-plus',
                    },
                ],
            },
        ]);

        return {
            handleUpdated: manager.updated,
            handleDeleted: manager.deleted,
            tabs,
            entity: manager.data.value,
        };
    },
});
</script>
<template>
    <div class="container">
        <div class="text-center">
            <h3 class="title no-border mb-3">
                {{ entity.name }}
            </h3>

            <hr>
        </div>

        <div>
            <div class="content-wrapper">
                <div class="content-sidebar flex-column">
                    <DomainEntityNav
                        :items="tabs"
                        :direction="'vertical'"
                        :path="'/admin/services/registry/' + entity.id "
                    />
                </div>
                <div class="content-container">
                    <NuxtPage
                        :entity="entity"
                        @updated="handleUpdated"
                        @deleted="handleDeleted"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
