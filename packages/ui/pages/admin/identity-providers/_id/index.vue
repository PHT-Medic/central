<!--
  Copyright (c) 2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { IdentityProvider } from '@authup/common';
import type { PropType } from 'vue';

export default {
    props: {
        entity: Object as PropType<IdentityProvider>,
    },
    methods: {
        handleUpdated(e) {
            this.$emit('updated', e);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        },
    },
};
</script>
<template>
    <o-auth2-provider-form
        :entity="entity"
        :realm-id="entity.realm_id"
        @updated="handleUpdated"
        @failed="handleFailed"
    />
</template>
