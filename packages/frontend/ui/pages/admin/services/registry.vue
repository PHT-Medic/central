<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import Vue from 'vue';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default {
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
    },
    data() {
        return {
            serviceId: undefined,
            tabs: [
                { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
                { name: 'Robot', icon: 'fa fa-robot', urlSuffix: '/robot' },
                { name: 'Master-Images', icon: 'fa-solid fa-sd-card', urlSuffix: '/master-images' },
            ],
        };
    },
};
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
                        <div>
                            <b-nav pills>
                                <b-nav-item
                                    :to="'/admin/services'"
                                    exact
                                    exact-active-class="active"
                                >
                                    <i class="fa fa-arrow-left" />
                                </b-nav-item>

                                <b-nav-item
                                    v-for="(item,key) in tabs"
                                    :key="key"
                                    :disabled="item.active"
                                    :to="'/admin/services/registry' + item.urlSuffix"
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
        <nuxt-child />
    </div>
</template>
