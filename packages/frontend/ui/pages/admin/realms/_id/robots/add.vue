<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../../../config/layout';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.USER_ADD,
        ],
    },
    props: {
        entity: Object,
    },
    methods: {
        handleCreated(e) {
            this.$nuxt.$router.push(`/admin/realms/${this.entity.id}/robots`);
        },
    },
};
</script>
<template>
    <robot-form
        :realm-id="entity.id"
        @created="handleCreated"
    />
</template>
