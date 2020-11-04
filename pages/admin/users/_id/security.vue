<script>
    import NotImplemented from "../../../../components/NotImplemented";
    import AlertMessage from "../../../../components/alert/AlertMessage";
    import userPasswordFormMixin from "../../../../mixins/userPasswordFormMixin";
    import UserPermissionListItem from "../../../../components/permission/UserPermissionListItem";
    import UserPermissionList from "../../../../components/permission/RolePermissionList";

    export default {
        props: {
            providedUser: {
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
        },
        data() {
            return {
                permission: {
                    items: [],
                    busy:false
                },
                userPermission: {
                    items: [],
                    formattedItems: [],
                    busy: false
                },

                message: null
            }
        },
        created() {
            this.userData = this.providedUser;
        },
        methods: {

        },
    }
</script>
<template>
    <div>
        <div class="row">
            <div class="col-7">
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
                            data: 'Aktivieren oder deaktivieren Sie Benutzer-Berechtigungen.'
                        }" />
                        <user-permission-list :user-id="providedUser.id" />
                    </div>
                </div>
            </div>
            <div class="col-5">

            </div>
        </div>
    </div>
</template>
