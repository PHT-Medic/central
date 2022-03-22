<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';
import { RegistryForm } from '../../../../components/domains/registry/RegistryForm';

export default {
    components: { RegistryForm },
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.ROBOT_ADD,
        ],
    },
    methods: {
        handleCreated(e) {
            this.$nuxt.$router.push(`/admin/registries/${e.id}`);
        },
    },
};
</script>
<template>
    <registry-form @created="handleCreated" />
</template>
