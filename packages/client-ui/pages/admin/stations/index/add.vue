<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Station } from '@personalhealthtrain/core';
import { PermissionID } from '@personalhealthtrain/core';
import { storeToRefs } from 'pinia';
import { StationForm } from '@personalhealthtrain/client-vue';
import { defineNuxtComponent } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';
import { useAuthStore } from '../../../../store/auth';

export default defineNuxtComponent({
    components: { StationForm },
    emits: ['created', 'failed'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.USER_ADD,
            ],
        });

        const store = useAuthStore();
        const { realmManagementId, realmManagementName } = storeToRefs(store);

        const handleCreated = async (e: Station) => {
            emit('created', e);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            realmManagementName,
            realmManagementId,
            handleCreated,
            handleFailed,
        };
    },
});
</script>
<template>
    <StationForm
        :realm-id="realmManagementId"
        :realm-name="realmManagementName"
        @created="handleCreated"
        @failed="handleFailed"
    />
</template>
