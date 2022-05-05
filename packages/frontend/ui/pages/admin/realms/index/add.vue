<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->

<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey } from '../../../../config/layout/contants';

export default {
    meta: {
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.REALM_ADD,
        ],
    },
    methods: {
        handleCreated(realm) {
            this.$router.push(`/admin/realms/${realm.id}`);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        },
    },
};
</script>
<template>
    <realm-form
        @created="handleCreated"
        @failed="handleFailed"
    />
</template>
