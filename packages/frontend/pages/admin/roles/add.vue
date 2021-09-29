<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import AlertMessage from "../../../components/alert/AlertMessage";
    import NotImplemented from "../../../components/NotImplemented";
    import {LayoutNavigationAdminId} from "../../../config/layout";
    import RoleForm from "@/components/role/RoleForm";

    export default {
        meta: {
            navigationId: LayoutNavigationAdminId,
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('add','role');
            }
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
    <div class="container">
        <h1 class="title no-border mb-3">
            Role <span class="sub-title">Add</span>
        </h1>

        <role-form :role-property="undefined" @created="handleRoleCreated" />
    </div>
</template>
<style>
    .list-group-item {
        padding: .45rem .65rem;
    }
</style>
