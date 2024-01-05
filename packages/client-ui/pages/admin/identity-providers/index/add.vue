<script lang="ts">
import { AIdentityProviderOAuth2Form } from '@authup/client-vue';
import type { IdentityProvider } from '@authup/core';
import { IdentityProviderProtocol, PermissionName } from '@authup/core';
import { VCFormSelect } from '@vuecs/form-controls';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { defineNuxtComponent, navigateTo } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';
import { useAuthStore } from '../../../../store/auth';

export default defineNuxtComponent({
    components: {
        VCFormSelect,
        AIdentityProviderOAuth2Form,
    },
    emits: ['failed', 'created'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.REALM_ADD,
            ],
        });

        const handleCreated = (e: IdentityProvider) => {
            navigateTo({ path: `/admin/identity-providers/${e.id}` });
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const protocol = ref<null | string>(null);

        const options = [
            { id: IdentityProviderProtocol.OAUTH2, value: 'OAuth2' },
            { id: IdentityProviderProtocol.OIDC, value: 'OIDC' },
            { id: IdentityProviderProtocol.LDAP, value: 'LDAP' },
        ];

        const store = useAuthStore();
        const { realmManagementId } = storeToRefs(store);

        return {
            options,
            protocol,
            realmManagementId,
            handleCreated,
            handleFailed,
        };
    },
});
</script>
<template>
    <div>
        <VCFormGroup
            :label="true"
            :label-content="'Protocol'"
        >
            <VCFormSelect
                v-model="protocol"
                :options="options"
            />
        </VCFormGroup>
        <template v-if="protocol === 'oauth2'">
            <hr>
            <AIdentityProviderOAuth2Form
                :realm-id="realmManagementId"
                @created="handleCreated"
                @failed="handleFailed"
            />
        </template>
    </div>
</template>
