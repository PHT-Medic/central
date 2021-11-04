<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script>
import {PermissionID} from "@personalhealthtrain/ui-common";
import UserDetailsForm from "../../../../components/domains/user/UserDetailsForm";
import {Layout, LayoutNavigationID} from "../../../../modules/layout/contants";

export default {
    meta: {
        [Layout.NAVIGATION_ID_KEY]: LayoutNavigationID.ADMIN,
        [Layout.REQUIRED_LOGGED_IN_KEY]: true,
        [Layout.REQUIRED_PERMISSIONS_KEY]: [
            PermissionID.USER_ADD
        ]
    },
    components: {
        UserDetailsForm,
    },
    methods: {
        handleCreated(e) {
            this.$nuxt.$router.push('/admin/users/' + e.id);
        }
    }
}
</script>
<template>
    <user-details-form @created="handleCreated" />
</template>
