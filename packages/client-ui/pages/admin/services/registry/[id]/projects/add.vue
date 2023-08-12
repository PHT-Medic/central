<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Registry, RegistryProject } from '@personalhealthtrain/central-common';
import { PermissionID } from '@personalhealthtrain/central-common';
import { useToast } from 'bootstrap-vue-next';
import type { PropType } from 'vue';
import { RegistryProjectForm } from '@personalhealthtrain/client-vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../../../../config/layout';

export default defineNuxtComponent({
    components: { RegistryProjectForm },
    props: {
        entity: {
            type: Object as PropType<Registry>,
            required: true,
        },
    },
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.REGISTRY_MANAGE,
            ],
        });

        const toast = useToast();

        const handleCreated = (e: RegistryProject) => {
            toast.success({ body: 'The project was successfully created.' });
        };

        const handleFailed = (e: Error) => {
            toast.danger({ body: e.message });
        };

        return {
            handleCreated,
            handleFailed,
        };
    },
});
</script>
<template>
    <RegistryProjectForm
        :registry-id="entity.id"
        @created="handleCreated"
        @failed="handleFailed"
    />
</template>
