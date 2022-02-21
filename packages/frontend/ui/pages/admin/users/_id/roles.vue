<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import UserRoleList from '../../../../components/domains/auth/user-role/UserRoleList';

export default {
    components: {
        UserRoleList,
    },
    props: {
        userProperty: {
            type: Object,
            default: undefined,
        },
    },
    data() {
        return {
            role: {
                items: [],
                busy: false,
            },
            q: '',
            showOnlyOwnedRoles: true,
        };
    },
};
</script>
<template>
    <div>
        <user-role-list :user-id="userProperty.id" />
    </div>
</template>
