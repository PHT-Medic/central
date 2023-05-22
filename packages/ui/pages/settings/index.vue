<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<template>
    <div>
        <h1 class="title no-border mb-3">
            <i class="fa fa-cog" /> Settings <span class="sub-title">Management</span>
        </h1>

        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <DomainEntityNav
                    :items="items"
                    :path="'/settings'"
                />
            </div>
            <div class="content-container">
                <NuxtPage />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineNuxtComponent, definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,

        });

        const items = [
            {
                name: 'Account', icon: 'fas fa-bars', urlSuffix: '',
            },
            {
                name: 'Security', icon: 'fa fa-lock', urlSuffix: '/security',
            },
            {
                name: 'Secrets', icon: 'fa fa-key', urlSuffix: '/secrets',
            },
        ];

        return {
            items,
        };
    },
});
</script>
