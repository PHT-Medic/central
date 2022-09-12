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
                <b-nav
                    pills
                    vertical
                >
                    <b-nav-item
                        v-for="(item,key) in sidebarItems"
                        :key="key"
                        :disabled="item.active"
                        :to="'/settings' + item.urlSuffix"
                        exact
                        exact-active-class="active"
                    >
                        <i :class="item.icon" />
                        {{ item.name }}
                    </b-nav-item>
                </b-nav>
            </div>
            <div class="content-container">
                <nuxt-child />
            </div>
        </div>
    </div>
</template>
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';

export default {
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
    },
    computed: {
        sidebarItems() {
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

            if (this.$auth.has([
                PermissionID.STATION_EDIT,
                PermissionID.STATION_DROP,
                PermissionID.STATION_EDIT,

                PermissionID.PROVIDER_ADD,
                PermissionID.PROVIDER_EDIT,
                PermissionID.PROVIDER_DROP,
            ])) {
                items.push({
                    name: 'Realm', icon: 'fas fa-university', urlSuffix: '/realm',
                });
            }

            return items;
        },
    },
};
</script>
