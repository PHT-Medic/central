<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default {
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
    },
    async asyncData(context) {
        try {
            const entity = await context.$authApi.realm.getOne(context.params.id);

            return {
                entity,
            };
        } catch (e) {
            await context.redirect('/admin/realms');
            return {

            };
        }
    },
    data() {
        return {
            entity: undefined,
            tabs: [
                { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
                { name: 'Station', icon: 'fa fa-city', urlSuffix: '/station' },
                { name: 'Users', icon: 'fa fa-users', urlSuffix: '/users' },
                { name: 'Robots', icon: 'fa fa-robot', urlSuffix: '/robots' },
                { name: 'Providers', icon: 'fas fa-boxes', urlSuffix: '/providers' },
            ],
        };
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
    },
};
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            {{ entity.name }} <span class="sub-title">Details</span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <div class="flex-wrap flex-row d-flex">
                        <div>
                            <b-nav pills>
                                <b-nav-item
                                    :to="'/admin/realms'"
                                    exact
                                    exact-active-class="active"
                                >
                                    <i class="fa fa-arrow-left" />
                                </b-nav-item>

                                <b-nav-item
                                    v-for="(item,key) in tabs"
                                    :key="key"
                                    :disabled="item.active"
                                    :to="'/admin/realms/' + entity.id + item.urlSuffix"
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
            </div>
        </div>
        <nuxt-child
            :entity="entity"
            @updated="handleUpdated"
        />
    </div>
</template>
