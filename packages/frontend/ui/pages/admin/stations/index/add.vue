<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';
import { StationForm } from '../../../../components/domains/station/StationForm';

export default {
    components: { StationForm },
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.USER_ADD,
        ],
    },
    computed: {
        managementRealmId() {
            return this.$store.getters['auth/managementRealmId'];
        },
    },
    methods: {
        handleCreated(e) {
            this.$bvToast.toast('The station was successfully created.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            this.$nuxt.$router.push(`/admin/stations/${e.id}`);
        },
        handleFailed(e) {
            this.$bvToast.toast(e.message, {
                toaster: 'b-toaster-top-center',
                variant: 'warning',
            });
        },
    },
};
</script>
<template>
    <station-form
        :realm-id="managementRealmId"
        @created="handleCreated"
        @failed="handleFailed"
    />
</template>
