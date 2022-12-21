<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import Vue from 'vue';
import { Socket } from 'socket.io-client';
import {
    SocketClientToServerEvents,
    SocketServerToClientEvents,
    TrainSocketClientToServerEventName, TrainSocketServerToClientEventName,
} from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';
import TrainName from '../../components/domains/train/TrainName.vue';

export default {
    components: { TrainName },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
    },
    async asyncData(context) {
        try {
            const entity = await context.$api.train.getOne(context.params.id, {
                relations: {
                    proposal: true,
                },
            });

            return {
                entity,
            };
        } catch (e) {
            await context.redirect('/trains');

            return {

            };
        }
    },
    data() {
        return {
            entity: undefined,
            tabs: [
                { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
                { name: 'Setup', icon: 'fa fa-wrench', urlSuffix: '/setup' },
            ],
        };
    },
    mounted() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.entity.realm_id);
        socket.emit(TrainSocketClientToServerEventName.SUBSCRIBE, { data: { id: this.entity.id } });
        socket.on(TrainSocketServerToClientEventName.UPDATED, this.handleSocketUpdated);
        socket.on(TrainSocketServerToClientEventName.DELETED, this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.entity.realm_id);
        socket.emit(TrainSocketClientToServerEventName.UNSUBSCRIBE, { data: { id: this.entity.id } });
        socket.off(TrainSocketServerToClientEventName.UPDATED, this.handleSocketUpdated);
        socket.off(TrainSocketServerToClientEventName.DELETED, this.handleSocketDeleted);
    },
    methods: {
        handleSocketUpdated(context) {
            if (
                this.entity.id !== context.data.id ||
                context.meta.roomId !== this.entity.id
            ) return;

            this.handleUpdated(context.data);
        },
        async handleSocketDeleted(context) {
            if (
                this.entity.id !== context.data.id ||
                context.meta.roomId !== this.entity.id
            ) return;

            await this.$nuxt.$router.push('/trains');
        },
        handleUpdated(data) {
            const keys = Object.keys(data);
            for (let i = 0; i < keys.length; i++) {
                Vue.set(this.entity, keys[i], data[keys[i]]);
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
                    :entity-id="entity.id"
                    :entity-name="entity.name"
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
                                    :to="'/trains/' + entity.id + tab.urlSuffix"
                                    :active="$route.path.startsWith('/trains/'+entity.id + tab.urlSuffix) && tab.urlSuffix.length !== 0"
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
            :entity="entity"
            @updated="handleUpdated"
        />
    </div>
</template>
