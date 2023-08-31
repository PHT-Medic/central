<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { IdentityProviderList } from '@authup/client-vue';
import { useToast } from 'bootstrap-vue-next';
import {
    ListPagination, ListSearch, ListTitle, LoginForm,
} from '@personalhealthtrain/client-vue';
import {
    definePageMeta, navigateTo, useAuthupAPI, useRoute,
} from '#imports';
import {
    defineNuxtComponent,
} from '#app';
import MedicineWorker from '../components/svg/MedicineWorker';
import { LayoutKey, LayoutNavigationID } from '../config/layout';

export default defineNuxtComponent({
    components: {
        LoginForm,
        ListPagination,
        ListSearch,
        ListTitle,
        IdentityProviderList,
        MedicineWorker,
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_OUT]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const toast = useToast();
        const route = useRoute();

        const handleDone = () => {
            const { redirect, ...query } = route.query;

            navigateTo({
                path: (redirect || '/') as string,
                query,
            });
        };

        const handleFailed = (e: Error) => {
            if (toast) {
                toast.warning({ body: e.message }, {
                    pos: 'top-center',
                });
            }
        };

        const buildIdentityProviderURL = (id: string) => {
            const apiClient = useAuthupAPI();
            return apiClient.identityProvider.getAuthorizeUri(
                apiClient.getBaseURL() as string,
                id,
            );
        };

        return {
            handleDone,
            handleFailed,
            translateValidationMessage,
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

        <div class="row">
            <div class="col-6">
                <LoginForm
                    @done="handleDone"
                    @failed="handleFailed"
                />
            </div>
            <div class="col-6">
                <IdentityProviderList>
                    <template #header="props">
                        <ListTitle
                            text="Providers"
                            icon-class="fa-solid fa-atom"
                        />
                        <ListSearch
                            :load="props.load"
                            :meta="props.meta"
                        />
                    </template>
                    <template #footer="props">
                        <ListPagination
                            :load="props.load"
                            :meta="props.meta"
                        />
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
    </div>
</template>
