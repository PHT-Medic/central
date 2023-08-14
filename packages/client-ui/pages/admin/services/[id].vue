<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ServiceID } from '@personalhealthtrain/core';
import {
    createError, defineNuxtComponent, definePageMeta, navigateTo, useRoute,
} from '#imports';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

const services = Object.values(ServiceID);

export default defineNuxtComponent({
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        });
        const route = useRoute();
        const index = services.indexOf(route.params.id as string);

        if (index === -1) {
            await navigateTo({ path: '/admin/services' });
            throw createError({});
        }

        const tabs = [
            { name: 'Tasks', icon: 'fas fa-bars', urlSuffix: '' },
            { name: 'Robot', icon: 'fa fa-robot', urlSuffix: '/robot' },
            { name: 'Settings', icon: 'fas fa-cog', urlSuffix: '/settings' },
        ];

        return {
            tabs,
            serviceId: services[index],
        };
    },
});
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            {{ serviceId }} <span class="sub-title">Service</span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <div class="flex-wrap flex-row d-flex">
                        <DomainEntityNav
                            :items="tabs"
                            :prev-link="true"
                            :path="'/admin/services/' + serviceId"
                        />
                    </div>
                </div>
            </div>
        </div>
        <NuxtPage
            :entity-id="serviceId"
        />
    </div>
</template>
