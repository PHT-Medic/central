<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import Vue from 'vue';
import { LayoutKey, LayoutNavigationID } from '../../config/layout/contants';
import TrainName from '../../components/domains/train/TrainName';

export default {
    components: { TrainName },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
    },
    async asyncData(context) {
        try {
            const item = await context.$api.train.getOne(context.params.id, {
                relations: {
                    proposal: true,
                },
            });

            return {
                item,
            };
        } catch (e) {
            await context.redirect('/trains');

            return {

            };
        }
    },
    data() {
        return {
            item: undefined,
            tabs: [
                { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
                { name: 'Setup', icon: 'fa fa-wrench', urlSuffix: '/setup' },
            ],
        };
    },
    mounted() {
        const socket = this.$socket.useRealmWorkspace(this.item.realm_id);
        socket.emit('trainsSubscribe', { data: { id: this.item.id } });
        socket.on('trainUpdated', this.handleSocketUpdated);
        socket.on('trainDeleted', this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket = this.$socket.useRealmWorkspace(this.item.realm_id);
        socket.emit('trainsUnsubscribe', { data: { id: this.item.id } });
        socket.off('trainUpdated', this.handleSocketUpdated);
        socket.off('trainDeleted', this.handleSocketDeleted);
    },
    methods: {
        handleSocketUpdated(context) {
            if (
                this.item.id !== context.data.id ||
                context.meta.roomId !== this.item.id
            ) return;

            this.handleUpdated(context.data);
        },
        async handleSocketDeleted(context) {
            if (
                this.item.id !== context.data.id ||
                context.meta.roomId !== this.item.id
            ) return;

            await this.$nuxt.$router.push('/trains');
        },
        handleUpdated(data) {
            const keys = Object.keys(data);
            for (let i = 0; i < keys.length; i++) {
                Vue.set(this.item, keys[i], data[keys[i]]);
            }
        },
    },
};
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            🚊 Train
            <span class="sub-title">
                <train-name
                    :train-id="item.id"
                    :train-name="item.name"
                />
            </span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <div class="flex-wrap flex-row d-flex align-items-center">
                        <div>
                            <b-nav pills>
                                <b-nav-item
                                    :to="'/trains'"
                                    exact
                                    exact-active-class="active"
                                >
                                    <i class="fa fa-arrow-left" />
                                </b-nav-item>

                                <b-nav-item
                                    v-for="(tab,key) in tabs"
                                    :key="key"
                                    :disabled="tab.active"
                                    :to="'/trains/' + item.id + tab.urlSuffix"
                                    :active="$route.path.startsWith('/trains/'+item.id + tab.urlSuffix) && tab.urlSuffix.length !== 0"
                                    exact-active-class="active"
                                    exact
                                >
                                    <i :class="tab.icon" />
                                    {{ tab.name }}
                                </b-nav-item>
                            </b-nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <nuxt-child
            :train="item"
            @updated="handleUpdated"
        />
    </div>
</template>
