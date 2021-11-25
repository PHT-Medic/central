<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/ui-common';
import UserDetailsForm from '../../../../components/domains/user/UserDetailsForm';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout/contants';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.USER_ADD,
        ],
    },
    components: {
        UserDetailsForm,
    },
    methods: {
        handleCreated(e) {
            this.$nuxt.$router.push(`/admin/users/${e.id}`);
        },
    },
};
</script>
<template>
    <user-details-form @created="handleCreated" />
</template>
