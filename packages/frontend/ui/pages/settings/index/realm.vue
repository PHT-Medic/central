<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default {
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
    },
    async asyncData(context) {
        try {
            const entity = await context.$authApi.realm.getOne(context.store.getters['auth/userRealmId']);

            return {
                entity,
            };
        } catch (e) {
            await context.redirect('/settings');
            return {

            };
        }
    },
    data() {
        return {
            entity: undefined,
        };
    },
    computed: {
        tabs() {
            const items = [
                { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
            ];

            if (this.$auth.hasPermission([
                PermissionID.STATION_EDIT,
                PermissionID.STATION_DROP,
                PermissionID.STATION_EDIT,
            ])) {
                items.push({ name: 'Stations', icon: 'fa-solid fa-house-medical', urlSuffix: '/stations' });
            }

            if (this.$auth.hasPermission([
                PermissionID.PROVIDER_ADD,
                PermissionID.PROVIDER_EDIT,
                PermissionID.PROVIDER_DROP,
            ])) {
                items.push({ name: 'Providers', icon: 'fa-solid fa-atom', urlSuffix: '/providers' });
            }

            return items;
        },
    },
    methods: {
        handleUpdated(item) {
            const keys = Object.keys(item);
            for (let i = 0; i < keys.length; i++) {
                this.entity[keys[i]] = item[keys[i]];
            }

            this.$bvToast.toast(`The realm ${item.name} was successfully updated.`, {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });
        },
        async handleFailed(e) {
            this.$bvToast.toast(e.message, {
                toaster: 'b-toaster-top-center',
                variant: 'warning',
            });
        },
    },
};
</script>
<template>
    <div>
        <div class="m-b-20 m-t-10">
            <div class="flex-wrap flex-row d-flex">
                <div>
                    <b-nav pills>
                        <b-nav-item
                            v-for="(item,key) in tabs"
                            :key="key"
                            :disabled="item.active"
                            :to="'/settings/realm' + item.urlSuffix"
                            exact
                            exact-active-class="active"
                        >
                            <i :class="item.icon" />
                            {{ item.name }}
                        </b-nav-item>
                    </b-nav>
                </div>
            </div>
        </div>
        <nuxt-child
            :entity="entity"
            @updated="handleUpdated"
            @failed="handleFailed"
        />
    </div>
</template>
