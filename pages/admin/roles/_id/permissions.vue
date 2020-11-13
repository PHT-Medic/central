<script>
    import NotImplemented from "../../../../components/NotImplemented";
    import AlertMessage from "../../../../components/alert/AlertMessage";
    import userPasswordFormMixin from "../../../../mixins/userPasswordFormMixin";
    import RolePermissionList from "../../../../components/permission/RolePermissionList";

    export default {
        props: {
            roleProperty: {
                type: Object
            }
        },
        components: {
            RolePermissionList,
            AlertMessage,
            NotImplemented
        }
    }
</script>
<template>
    <div>
        <div class="panel-card">
            <div class="panel-card-header">
                <h6 class="title">
                    Berechtigungen
                </h6>
            </div>
            <div class="panel-card-body">
                <alert-message
                    :message="{
                    isError: false,
                    data: 'Aktivieren oder deaktivieren Sie Rollen-Berechtigungen.'
                }" />
                <role-permission-list :role-id-property="roleProperty.id" />
            </div>
        </div>
    </div>
</template>
