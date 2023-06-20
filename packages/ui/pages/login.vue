<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { IdentityProviderList } from '@authup/client-vue';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import { useToast } from 'bootstrap-vue-next';
import { isClientError } from 'hapic';
import {
    reactive, ref, toRef, watch,
} from 'vue';
import type { IdentityProvider } from '@authup/core';
import type { BuildInput } from 'rapiq';
import { definePageMeta, useRuntimeConfig } from '#imports';
import {
    defineNuxtComponent, navigateTo, useNuxtApp, useRoute,
} from '#app';
import MedicineWorker from '../components/svg/MedicineWorker';
import { useAuthupAPI } from '../composables/api';
import { translateValidationMessage } from '../composables/ilingo';
import { LayoutKey, LayoutNavigationID } from '../config/layout';
import { useAuthStore } from '../store/auth';

export default defineNuxtComponent({
    components: {
        IdentityProviderList,
        MedicineWorker,
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_OUT]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const runtimeConfig = useRuntimeConfig();

        const form = reactive({
            name: '',
            password: '',
            realm_id: '',
        });

        const vuelidate = useVuelidate({
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(255),
            },
            password: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(255),
            },
            realm_id: {

            },
        }, form);

        const toast = useToast();

        const store = useAuthStore();

        const busy = ref(false);

        const realmId = toRef(form, 'realm_id');

        let identityProviderQuery : BuildInput<IdentityProvider> = {
            filters: {
                realm_id: realmId.value || '',
            },
        };
        const identityProviderRef = ref<null | { load:() => any, [key: string]: any}>(null);

        watch(realmId, async (val, oldVal) => {
            if (val !== oldVal) {
                if (identityProviderRef.value) {
                    identityProviderQuery = {
                        filters: {
                            realm_id: realmId.value || '',
                        },
                    };
                    identityProviderRef.value.load();
                }
            }
        });

        const submit = async () => {
            try {
                await store.login({
                    name: form.name,
                    password: form.password,
                    realmId: form.realm_id,
                });

                const route = useRoute();
                const { redirect, ...query } = route.query;

                navigateTo({
                    path: (redirect || '/') as string,
                    query,
                });
            } catch (e: any) {
                if (isClientError(e)) {
                    toast.warning({ body: e.message }, {
                        pos: 'top-center',
                    });
                }
            }
        };

        Promise.resolve()
            .then(store.logout);

        const buildIdentityProviderURL = (id: string) => {
            const apiClient = useAuthupAPI();
            return apiClient.identityProvider.getAuthorizeUri(
                runtimeConfig.public.authupApiUrl,
                id,
            );
        };

        return {
            vuelidate,
            translateValidationMessage,
            form,
            submit,
            busy,

            identityProviderQuery,
            identityProviderRef,
            buildIdentityProviderURL,
        };
    },
});
</script>
<template>
    <div class="container">
        <h4>
            <i class="fa-solid fa-arrow-right-to-bracket pe-2" />
            Login
        </h4>
        <div class="text-center">
            <MedicineWorker :height="320" />
        </div>
        <form @submit.prevent="submit">
            <div class="row">
                <div class="col-6">
                    <FormInput
                        v-model="form.name"
                        :validation-result="vuelidate.name"
                        :validation-translator="translateValidationMessage"
                        :label="true"
                        :label-content="'Name'"
                    />

                    <FormInput
                        v-model="form.password"
                        type="password"
                        :validation-result="vuelidate.password"
                        :validation-translator="translateValidationMessage"
                        :label="true"
                        :label-content="'Password'"
                    />

                    <FormSubmit
                        v-model="busy"
                        :validation-result="vuelidate"
                        :create-text="'Login'"
                        :create-button-class="{value: 'btn btn-sm btn-dark btn-block', presets: { bootstrap: false }}"
                        :create-icon-class="'fa-solid fa-right-to-bracket'"
                        :submit="submit"
                    />
                </div>
                <div class="col-6">
                    <IdentityProviderList
                        ref="identityProviderRef"
                        :query="identityProviderQuery"
                    >
                        <template #header>
                            <h6 class="mb-2">
                                <i class="fa-solid fa-atom" /> Providers
                            </h6>
                        </template>
                        <template #item="props">
                            <div>
                                <strong>{{ props.data.name }}</strong>
                            </div>
                            <div class="ms-auto">
                                <a
                                    :href="buildIdentityProviderURL(props.data.id)"
                                    class="btn btn-primary btn-xs"
                                >
                                    {{ props.data.name }}
                                </a>
                            </div>
                        </template>
                    </IdentityProviderList>
                </div>
            </div>
        </form>
    </div>
</template>
