<!--
  - Copyright (c) 2021-2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script>
    import AlertMessage from "../../../../components/alert/AlertMessage";
    import PermissionForm from "../../../../components/domains/permission/PermissionForm";
    import NotImplemented from "../../../../components/NotImplemented";
    import RoleForm from "../../../../components/domains/role/RoleForm";
    import {Layout, LayoutNavigationID} from "../../../../modules/layout/contants";

    export default {
        meta: {
            [Layout.NAVIGATION_ID_KEY]: LayoutNavigationID.ADMIN,
            [Layout.REQUIRED_LOGGED_IN_KEY]: true,
        },
        components: {
            PermissionForm,
            RoleForm,
            AlertMessage,
            NotImplemented
        },
        methods: {
            handleCreated() {
                this.$router.push('/admin/permissions');
            }
        }
    }
</script>
<template>
    <permission-form :permission-property="undefined" @created="handleCreated" />
</template>
