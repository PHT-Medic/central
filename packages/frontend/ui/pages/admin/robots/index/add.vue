<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout/contants';
import RobotForm from '../../../../components/domains/auth/robot/RobotForm';

export default {
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.ROBOT_ADD,
        ],
    },
    components: {
        RobotForm,
    },
    methods: {
        handleCreated(e) {
            this.$nuxt.$router.push(`/admin/robots/${e.id}`);
        },
    },
};
</script>
<template>
    <robot-form @created="handleCreated" />
</template>
