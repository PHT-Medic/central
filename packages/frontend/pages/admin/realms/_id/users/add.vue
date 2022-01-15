<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/ui-common';
import UserDetailsForm from '../../../../../components/domains/auth/user/UserDetailsForm';
import { LayoutKey, LayoutNavigationID } from '../../../../../config/layout/contants';

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
    props: {
        realm: Object,
    },
    methods: {
        handleCreated(e) {
            this.$nuxt.$router.push(`/admin/realms/${this.realm.id}/users/${e.id}`);
        },
    },
};
</script>
<template>
    <user-details-form
        :realm-id="realm.id"
        @created="handleCreated"
    />
</template>
