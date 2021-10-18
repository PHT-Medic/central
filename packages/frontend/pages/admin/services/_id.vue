<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {LayoutNavigationAdminId} from "../../../config/layout";
import Vue from "vue";
import {SERVICE_ID} from "@personalhealthtrain/ui-common";

const services = Object.values(SERVICE_ID);

export default {
    meta: {
        requireLoggedIn: true,
        navigationId: LayoutNavigationAdminId
    },
    async asyncData(context) {
        const index = services.indexOf(context.params.id);

        if(index === -1) {
            await context.redirect('/admin/services');
        }

        return {
            serviceId: services[index]
        };
    },
    data() {
        return {
            serviceId: undefined,
            tabs: [
                { name: 'Tasks', icon: 'fas fa-bars', urlSuffix: '' },
                { name: 'Client', icon: 'fa fa-robot', urlSuffix: '/client'},
                { name: 'Settings', icon: 'fas fa-cog', urlSuffix: '/settings'}
            ]
        }
    },
    methods: {
        update(data) {
            for(let key in data) {
                Vue.set(this.service, key, data[key]);
            }
        }
    }
}
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            {{serviceId}} <span class="sub-title">Service</span>
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
                                    :to="'/admin/services/' + serviceId + item.urlSuffix"
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
        <nuxt-child :service-id="serviceId" @updated="update" />
    </div>
</template>
