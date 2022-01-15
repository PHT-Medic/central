<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { Role } from '@personalhealthtrain/ui-common';
import RoleForm from '../../../../components/domains/auth/role/RoleForm';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout/contants';

export default {
    components: {
        RoleForm,
    },
    props: {
        roleProperty: {
            type: Role,
        },
    },
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
    },
    data() {
        return {
            roleData: undefined,
        };
    },
    created() {
        this.roleData = this.roleProperty;
    },
    methods: {
        handleRoleUpdated(e) {
            const { id, ...data } = e;
            // eslint-disable-next-line no-restricted-syntax
            for (const key in data) {
                this.roleData[key] = data[key];
            }
        },
    },
};
</script>
<template>
    <div>
        <role-form
            :role-property="roleData"
            @updated="handleRoleUpdated"
        />
    </div>
</template>
