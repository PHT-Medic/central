<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import Vue from 'vue';
import {LayoutNavigationDefaultId} from "@/config/layout.ts";
import {getTrain} from "@/domains/train/api.ts";

export default {
    meta: {
        requireLoggedIn: true,
        navigationId: LayoutNavigationDefaultId
    },
    async asyncData(context) {
        try {
            const train = await getTrain(context.params.id);

            return {
                train
            };
        } catch (e) {
            await context.redirect('/trains');
        }
    },
    data() {
        return {
            train: undefined,
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
                Vue.set(this.train, key, train[key]);
            }
        }
    }
}
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            Train
            <span class="sub-title">{{ train.id }} </span>
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
                        v-for="(item,key) in tabs"
                        :key="key"
                        :disabled="item.active"
                        :to="'/trains/'  +train.id + item.urlSuffix"
                        :active="$route.path.startsWith('/trains/'+train.id + item.urlSuffix) && item.urlSuffix.length !== 0"
                        exact-active-class="active"
                        exact
                    >
                        <i :class="item.icon" />
                        {{ item.name }}
                    </b-nav-item>
                </b-nav>
            </div>
            <div class="content-container">
                <nuxt-child :train="train" @updated="updateTrain" />
            </div>
        </div>
    </div>
</template>
