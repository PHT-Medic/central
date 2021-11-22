<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {getAPITrain} from "@personalhealthtrain/ui-common";
import Vue from 'vue';
import {LayoutKey, LayoutNavigationID} from "../../config/layout/contants";

export default {
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT
    },
    async asyncData(context) {
        try {
            const item = await getAPITrain(context.params.id, {
                relations: {
                    proposal: true
                }
            });

            return {
                item
            };
        } catch (e) {
            await context.redirect('/trains');
        }
    },
    data() {
        return {
            item: undefined,
            tabs: [
                { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
                { name: 'Configuration', icon: 'fa fa-cog', urlSuffix: '/wizard'},
                { name: 'Stations', icon: 'fa fa-city', urlSuffix: '/stations' }
            ]
        }
    },
    methods: {
        updateTrain(train) {
            for(let key in train) {
                Vue.set(this.item, key, train[key]);
            }
        }
    }
}
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            Train
            <span class="sub-title">{{ item.id }} </span>
        </h1>

        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <b-nav  pills vertical>
                    <b-nav-item
                        :to="'/trains'"
                        exact
                        exact-active-class="active"
                    >
                        <i class="fa fa-arrow-left" />
                    </b-nav-item>

                    <b-nav-item
                        v-for="(navItem,key) in tabs"
                        :key="key"
                        :disabled="navItem.active"
                        :to="'/trains/'  +item.id + navItem.urlSuffix"
                        :active="$route.path.startsWith('/trains/'+item.id + navItem.urlSuffix) && navItem.urlSuffix.length !== 0"
                        exact-active-class="active"
                        exact
                    >
                        <i :class="navItem.icon" />
                        {{ navItem.name }}
                    </b-nav-item>
                </b-nav>
            </div>
            <div class="content-container">
                <nuxt-child :train="item" @updated="updateTrain" />
            </div>
        </div>
    </div>
</template>
