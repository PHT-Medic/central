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
        <h4 class="title m-b-10">
            Rolle <span class="sub-title">Hinzufügen</span>
        </h4>

        <div class="row">
            <div class="col">
                <div class="panel-card m-b-20">
                    <div class="panel-card-header">
                        <h5 class="title">
                            Allgemein <i class="fa fa-info"></i>
                        </h5>
                    </div>
                    <div class="panel-card-body">
                        <role-form :role-property="undefined" @created="handleRoleCreated" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
    .list-group-item {
        padding: .45rem .65rem;
    }
</style>
