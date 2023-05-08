<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { defineNuxtComponent } from '#app';
import { definePageMeta } from '#imports';
import DomainEntityNav from '../../components/DomainEntityNav';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';

export default defineNuxtComponent({
    components: { DomainEntityNav },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });
        const items = [
            {
                name: 'Create',
                urlSuffix: '/add',
                icon: 'fa fa-plus',
            },
            {
                name: 'Outgoing',
                urlSuffix: '',
                icon: 'fa fa-file-export',
            },
            {
                name: 'Incoming',
                urlSuffix: '/in',
                icon: 'fa fa-file-import',
            },
        ];

        return {
            items,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            🚊 Train(s) <span class="sub-title">Manage incoming & outgoing trains</span>
        </h1>

        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <DomainEntityNav
                    :items="items"
                    :path="'/trains'"
                    :direction="'vertical'"
                />
            </div>
            <div class="content-container">
                <NuxtPage />
            </div>
        </div>
    </div>
</template>
