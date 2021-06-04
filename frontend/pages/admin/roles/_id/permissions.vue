<script>
    import NotImplemented from "../../../../components/NotImplemented";
    import AlertMessage from "../../../../components/alert/AlertMessage";
    import RolePermissionList from "@/components/role/permission/RolePermissionList";

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
        <role-permission-list :role-id="roleProperty.id" />
    </div>
</template>
