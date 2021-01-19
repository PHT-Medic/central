<script>
import Vue from 'vue';
import {LayoutNavigationDefaultId} from "@/config/layout.ts";
import {getTrain} from "@/domains/train/api.ts";
import TrainConfiguratorStatusButton from "@/components/train/button/TrainConfiguratorStatusButton";
import TrainConfiguratorStatusText from "@/components/train/text/TrainConfiguratorStatusText";

export default {
    components: {TrainConfiguratorStatusText, TrainConfiguratorStatusButton},
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
                { name: 'Wizard', icon: 'fas fa-hat-wizard', urlSuffix: '/wizard'},
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
    <div class="container">
        <div class="text-center">
            <h6 class="display-1"><i class="fa fa-train"></i></h6>
        </div>

        <div class="d-flex flex-row align-items-baseline">
            <div>
                <h4 class="title mb-0">
                    Train <span class="sub-title">{{ train.id }}</span>
                </h4>
            </div>
            <div class="ml-auto" style="font-size: .8rem;">
                <h6 class="h6">Status: <train-configurator-status-text :status="train.configuratorStatus" class="text-info" /></h6>
            </div>
        </div>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <div class="flex-wrap flex-row d-flex">
                        <div>
                            <b-nav pills>
                                <b-nav-item
                                    v-for="(item,key) in tabs"
                                    :key="key"
                                    :disabled="item.active"
                                    :to="'/trains/' + train.id + item.urlSuffix"
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
        <nuxt-child :train="train" @updated="updateTrain" />
    </div>
</template>
