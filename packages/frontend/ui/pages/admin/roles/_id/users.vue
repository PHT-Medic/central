<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { Role } from '@personalhealthtrain/central-common';
import RoleUserList from '../../../../components/domains/auth/role-user/RoleUserList';

export default {
    components: {
        RoleUserList,
    },
    props: {
        roleProperty: {
            type: Role,
            default: undefined,
        },
    },
};
</script>
<template>
    <div>
        <role-user-list :role-id="roleProperty.id" />
    </div>
</template>
