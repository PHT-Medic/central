<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { defineNuxtComponent, definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
        });

        const tabs = [
            { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
            { name: 'Robot', icon: 'fa fa-robot', urlSuffix: '/robot' },
            { name: 'Master-Images', icon: 'fa-solid fa-sd-card', urlSuffix: '/master-images' },
        ];

        return {
            tabs,
        };
    },
});
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            <i class="fa-brands fa-docker" /> Registry <span class="sub-title">Management</span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <div class="flex-wrap flex-row d-flex">
                        <DomainEntityNav
                            :items="tabs"
                            :prev-link="true"
                            :path="'/admin/services/registry'"
                        />
                    </div>
                </div>
            </div>
        </div>
        <NuxtPage />
    </div>
</template>
