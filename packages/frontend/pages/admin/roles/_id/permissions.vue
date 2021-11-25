<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { Role } from '@personalhealthtrain/ui-common';
import NotImplemented from '../../../../components/NotImplemented';
import AlertMessage from '../../../../components/alert/AlertMessage';
import RolePermissionList from '../../../../components/domains/role-permission/RolePermissionList';

export default {
    components: {
        RolePermissionList,
        AlertMessage,
        NotImplemented,
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
