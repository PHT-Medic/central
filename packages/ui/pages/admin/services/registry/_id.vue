<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Registry } from '@personalhealthtrain/central-common';
import { Ecosystem, PermissionID } from '@personalhealthtrain/central-common';
import { useToast } from 'bootstrap-vue-next';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';
import {
    createError,
    definePageMeta, navigateTo, updateObjectProperties, useAPI, useRoute,
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

        let entity : Ref<Registry>;

        try {
            const response = await useAPI().registry.getOne(route.params.id as string, {
                fields: ['+account_secret'],
            });

            entity = ref(response);
        } catch (e) {
            await navigateTo({ path: '/admin/services/registries' });
            throw createError({});
        }

        const tabs = computed(() => [
            {
                name: 'General', icon: 'fas fa-bars', urlSuffix: '',
            },
            ...(entity.value.ecosystem === Ecosystem.DEFAULT ?
                [{
                    name: 'Setup', icon: 'fa-solid fa-cog', urlSuffix: 'setup',
                }] : []
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

        const handleUpdated = (item: Registry) => {
            updateObjectProperties(entity, item);

            toast.success({ body: 'The registry was successfully updated.' });
        };
        const handleDeleted = async () => {
            toast.success({ body: 'The registry was successfully deleted.' });

            await navigateTo('/admin/registries');
        };

        return {
            handleUpdated,
            handleDeleted,
            tabs,
            entity,
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
