<!--
  - Copyright (c) 2021.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PermissionID } from '@personalhealthtrain/central-common';
import { PropType } from 'vue';
import { Realm } from '@typescript-auth/domains';
import { LayoutKey, LayoutNavigationID } from '../../../../../config/layout';
import { StationForm } from '../../../../../components/domains/station/StationForm';

export default {
    components: { StationForm },
    meta: {
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.USER_ADD,
        ],
    },
    props: {
        entity: Object as PropType<Realm>,
    },
    methods: {
        handleCreated(e) {
            this.$bvToast.toast('The station was successfully created.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            this.$nuxt.$router.push(`/admin/realms/${this.entity.id}/stations/${e.id}`);
        },
    },
};
</script>
<template>
    <station-form
        :realm-id="entity.id"
        :realm-name="entity.name"
        @created="handleCreated"
    />
</template>
