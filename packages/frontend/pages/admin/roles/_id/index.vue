<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import {Role} from "@personalhealthtrain/ui-common";
    import NotImplemented from "../../../../components/NotImplemented";
    import {LayoutNavigationAdminId} from "../../../../config/layout";
    import AlertMessage from "../../../../components/alert/AlertMessage";
    import RoleForm from "../../../../components/role/RoleForm";

    export default {
        props: {
            roleProperty: {
                type: Role
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
                roleData: undefined
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
        <role-form :role-property="roleData" @updated="handleRoleUpdated" />
    </div>
</template>
