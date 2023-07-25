<script lang="ts">

import { IdentityProviderOAuth2Form } from '@authup/client-vue';
import type { IdentityProvider } from '@authup/core';
import { PermissionName } from '@authup/core';
import type { PropType } from 'vue';
import { defineNuxtComponent, definePageMeta, useRuntimeConfig } from '#imports';
import { LayoutKey } from '~/config/layout';

export default defineNuxtComponent({
    components: {
        IdentityProviderOAuth2Form,
    },
    props: {
        entity: {
            type: Object as PropType<IdentityProvider>,
            required: true,
        },
    },
    emits: ['updated', 'failed'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.REALM_EDIT,
            ],
        });

        const runtimeConfig = useRuntimeConfig();
        const handleUpdated = (e: IdentityProvider) => {
            emit('updated', e);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            apiUrl: runtimeConfig.public.authupApiUrl as string,
            entity: props.entity,
            handleUpdated,
            handleFailed,
        };
    },
});
</script>
<template>
    <IdentityProviderOAuth2Form
        :api-url="apiUrl"
        :entity="entity"
        :realm-id="entity.realm_id"
        @updated="handleUpdated"
        @failed="handleFailed"
    />
</template>
