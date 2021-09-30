<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import NotImplemented from "../../../../components/NotImplemented";
    import AlertMessage from "../../../../components/alert/AlertMessage";
    import RolePermissionList from "../../../../components/role/permission/RolePermissionList";

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
