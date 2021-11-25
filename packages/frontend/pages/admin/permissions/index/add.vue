<!--
  - Copyright (c) 2021-2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script>
import AlertMessage from '../../../../components/alert/AlertMessage';
import PermissionForm from '../../../../components/domains/permission/PermissionForm';
import NotImplemented from '../../../../components/NotImplemented';
import RoleForm from '../../../../components/domains/role/RoleForm';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout/contants';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
    },
    components: {
        PermissionForm,
        RoleForm,
        AlertMessage,
        NotImplemented,
    },
    methods: {
        handleCreated() {
            this.$router.push('/admin/permissions');
        },
    },
};
</script>
<template>
    <permission-form
        :permission-property="undefined"
        @created="handleCreated"
    />
</template>
