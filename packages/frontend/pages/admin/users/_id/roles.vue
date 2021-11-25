<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import NotImplemented from '../../../../components/NotImplemented';
import UserRoleList from '../../../../components/domains/user-role/UserRoleList';

export default {
    components: {
        UserRoleList,
        NotImplemented,
    },
    props: {
        userProperty: {
            type: Object,
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
    methods: {
        handleCreated(e) {

        },
        handleDeleted(e) {

        },
    },
};
</script>
<template>
    <div>
        <vue-scroll style="height:500px">
            <user-role-list :user-id="userProperty.id" />
        </vue-scroll>
    </div>
</template>
