<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { defineNuxtComponent } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const tabs = [
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
            tabs,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            📜 Proposal(s) <span class="sub-title">Manage incoming & outgoing proposals</span>
        </h1>

        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <DomainEntityNav
                    :items="tabs"
                    :path="'/proposals'"
                    :direction="'vertical'"
                />
            </div>
            <div class="content-container">
                <NuxtPage />
            </div>
        </div>
    </div>
</template>
