<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import {Role} from "@personalhealthtrain/ui-common";
    import RoleUserList from "../../../../components/domains/role-user/RoleUserList";

    export default {
        props: {
            roleProperty: {
                type: Role
            }
        },
        components: {
            RoleUserList
        },
    }
</script>
<template>
    <div>
        <vue-scroll style="height:500px">
            <role-user-list :role-id="roleProperty.id" />
        </vue-scroll>
    </div>
</template>
