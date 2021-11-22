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
    import {LayoutKey, LayoutNavigationID} from "../../../../config/layout/contants";
    import {PermissionID} from "@personalhealthtrain/ui-common";

    export default {
        meta: {
            meta: {
                [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
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
