<!--
  Copyright (c) 2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { OAuth2ProviderForm } from '@authup/client-vue';
import type { IdentityProvider } from '@authup/core';
import { toRefs } from 'vue';
import type { PropType } from 'vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: {
        OAuth2ProviderForm,
    },
    props: {
        entity: Object as PropType<IdentityProvider>,
        required: true,
    },
    emits: ['updated', 'failed'],
    setup(props, { emit }) {
        const refs = toRefs(props);


            const handleUpdated = (e: IdentityProvider) => {
                this.$emit('updated', e);
            },
            handleFailed(e) {
                this.$emit('failed', e);
            },

        return {
            entity: refs.entity,
        };
    }
});
</script>
<template>
    <OAuth2ProviderForm
        :entity="entity"
        :realm-id="entity.realm_id"
        @updated="handleUpdated"
        @failed="handleFailed"
    />
</template>
