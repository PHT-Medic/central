<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import AlertMessage from "../../../../components/alert/AlertMessage";
    import NotImplemented from "../../../../components/NotImplemented";
    import {LayoutNavigationAdminId} from "../../../../config/layout";
    import RoleForm from "../../../../components/domains/role/RoleForm";
    import {Layout, LayoutNavigationID} from "../../../../modules/layout/contants";
    import {PermissionID} from "@personalhealthtrain/ui-common";

    export default {
        meta: {
            meta: {
                [Layout.NAVIGATION_ID_KEY]: LayoutNavigationID.ADMIN,
                [Layout.REQUIRED_LOGGED_IN_KEY]: true,
                [Layout.REQUIRED_PERMISSIONS_KEY]: [
                    PermissionID.ROLE_ADD
                ]
            },
        },
        components: {
            RoleForm,
            AlertMessage,
            NotImplemented
        },
        methods: {
            handleRoleCreated(e) {
                this.$router.push('/admin/roles/' + e.id);
            }
        }
    }
</script>
<template>
    <role-form :role-property="undefined" @created="handleRoleCreated" />
</template>
<style>
    .list-group-item {
        padding: .45rem .65rem;
    }
</style>
