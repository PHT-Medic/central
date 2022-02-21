<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { Role } from '@personalhealthtrain/central-common';
import RolePermissionList from '../../../../components/domains/auth/role-permission/RolePermissionList';

export default {
    components: {
        RolePermissionList,
    },
    props: {
        roleProperty: {
            type: Role,
        },
    },
};
</script>
<template>
    <div>
        <role-permission-list :role-id="roleProperty.id" />
    </div>
</template>
