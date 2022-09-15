<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">

import { PropType } from 'vue';
import { Realm } from '@authelion/common';

export default {
    props: {
        entity: Object as PropType<Realm>,
    },
    methods: {
        async handleCreated(e) {
            this.$bvToast.toast('The provider was successfully created.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            await this.$nuxt.$router.push(`/admin/realms/${this.entity.id}/providers/${e.id}`);
        },
        async handleFailed(e) {
            this.$bvToast.toast(e.message, {
                toaster: 'b-toaster-top-center',
                variant: 'warning',
            });
        },
    },
};
</script>
<template>
    <o-auth2-provider-form
        :realm-id="entity.id"
        @created="handleCreated"
        @failed="handleFailed"
    />
</template>
