<script>
    import NotImplemented from "../../../../components/NotImplemented";
    import {LayoutNavigationAdminId} from "../../../../config/layout";
    import AlertMessage from "../../../../components/alert/AlertMessage";
    import RoleForm from "@/components/role/RoleForm";

    export default {
        props: {
            roleProperty: {
                type: Object
            }
        },
        meta: {
            navigationId: LayoutNavigationAdminId
        },
        components: {
            RoleForm,
            NotImplemented,
            AlertMessage
        },
        data() {
            return {
                roleData: null
            }
        },
        created() {
            this.roleData = this.roleProperty;
        },
        methods: {
            handleRoleUpdated(e) {
                const {id, ...data} = e;
                for(let key in data) {
                    this.roleData[key] = data[key];
                }
            }
        }
    }
</script>
<template>
    <div>
        <div class="panel-card">
            <div class="panel-card-header">
                <h6 class="title">
                    Allgmein
                </h6>
            </div>
            <div class="panel-card-body">
                <role-form :role-property="roleData" @roleUpdated="handleRoleUpdated" />
            </div>
        </div>
    </div>
</template>
