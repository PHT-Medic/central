<script>
    import NotImplemented from "../../../../components/NotImplemented";
    import AlertMessage from "../../../../components/alert/AlertMessage";
    import userPasswordFormMixin from "../../../../mixins/userPasswordFormMixin";
    import UserPermissionListItem from "../../../../components/permission/UserPermissionListItem";
    import UserPermissionList from "../../../../components/permission/RolePermissionList";

    export default {
        props: {
            roleProperty: {
                type: Object
            }
        },
        mixins: [
            userPasswordFormMixin
        ],
        components: {
            UserPermissionList,
            UserPermissionListItem,
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
                <user-permission-list :role-id="roleProperty.id" />
            </div>
        </div>
    </div>
</template>
