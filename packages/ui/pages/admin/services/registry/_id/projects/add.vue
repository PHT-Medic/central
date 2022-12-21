<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PermissionID, Registry } from '@personalhealthtrain/central-common';
import { PropType } from 'vue';
import { LayoutKey, LayoutNavigationID } from '../../../../../../config/layout';
import { RegistryProjectForm } from '../../../../../../components/domains/registry-project/RegistryProjectForm';

export default {
    components: { RegistryProjectForm },
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.REGISTRY_MANAGE,
        ],
    },
    props: {
        entity: Object as PropType<Registry>,
    },
    methods: {
        handleCreated(e) {
            this.$bvToast.toast('The project was successfully created.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            this.$nuxt.$router.push(`/admin/services/registry/${this.entity.id}/projects/${e.id}`);
        },
        handleFailed(e) {
            this.$bvToast.toast(e.message, {
                toaster: 'b-toaster-top-center',
                variant: 'warning',
            });
        },
    },
};
</script>
<template>
    <registry-project-form
        :registry-id="entity.id"
        @created="handleCreated"
        @failed="handleFailed"
    />
</template>
