<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import Vue from 'vue';
import type { Socket } from 'socket.io-client';
import type {
    SocketClientToServerEvents,
    SocketServerToClientEventContext, SocketServerToClientEvents,
    Station,
} from '@personalhealthtrain/central-common';
import { StationSocketClientToServerEventName, StationSocketServerToClientEventName } from '@personalhealthtrain/central-common';
import type { ComponentListHandlerMethodOptions } from '@vue-layout/utils';
import { StationForm } from '../../../components/domains/station/StationForm';

export default Vue.extend<any, any, any, any>({
    components: { StationForm },
    async asyncData(context) {
        try {
            const { data: stations } = await context.$api.station.getMany({
                filter: {
                    id: context.params.id,
                },
                fields: [
                    '+registry_id',
                    '+registry_project_id',
                    '+public_key',
                    '+email',
                    '+external_name',
                ],
            });

            if (stations.length === 0) {
                await context.redirect('/admin/stations');

                return {
                    entity: undefined,
                };
            }

            return {
                entity: stations[0],
            };
        } catch (e) {
            await context.redirect('/admin/stations');

            return {
                entity: undefined,
            };
        }
    },
    data() {
        return {
            entity: undefined,
            tabs: [
                { name: 'Overview', icon: 'fas fa-bars', urlSuffix: '' },
            ],
        };
    },
    created() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.entity.realm_id);

        if (this.entity) {
            socket.emit(StationSocketClientToServerEventName.SUBSCRIBE, { data: { id: this.entity.id } });
            socket.on(StationSocketServerToClientEventName.UPDATED, this.handleSocketUpdated);
        }
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.entity.realm_id);

        if (this.entity) {
            socket.emit(StationSocketClientToServerEventName.UNSUBSCRIBE, { data: { id: this.entity.id } });
            socket.off(StationSocketServerToClientEventName.UPDATED, this.handleSocketUpdated);
        }
    },
    methods: {
        handleSocketUpdated(context: SocketServerToClientEventContext<Station>) {
            if (
                this.entity.id !== context.data.id ||
                context.meta.roomId !== this.entity.id
            ) return;

            this.handleUpdated(context.data, { displayMessage: false });
        },
        handleUpdated(
            item: Station,
            options?: ComponentListHandlerMethodOptions<Station> & {displayMessage?: boolean},
        ) {
            options = options || {};
            options.displayMessage = options.displayMessage ?? true;

            const keys = Object.keys(item);
            for (let i = 0; i < keys.length; i++) {
                Vue.set(this.entity, keys[i], item[keys[i]]);
            }

            if (options.displayMessage) {
                this.$bvToast.toast('The station was successfully updated.', {
                    toaster: 'b-toaster-top-center',
                    variant: 'success',
                });
            }
        },
        async handleDeleted() {
            this.$bvToast.toast('The station was successfully deleted.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });

            await this.$nuxt.$router.push(`/admin/realms/${this.enitty.id}/stations`);
        },
        handleFailed(e) {
            this.$bvToast.toast(e.message, {
                toaster: 'b-toaster-top-center',
                variant: 'warning',
            });
        },
    },
});
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            {{ entity.name }} <span class="sub-title">Details</span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="flex-wrap flex-row d-flex">
                <div>
                    <b-nav pills>
                        <b-nav-item
                            :to="'/admin/stations'"
                            exact
                            exact-active-class="active"
                        >
                            <i class="fa fa-arrow-left" />
                        </b-nav-item>

                        <b-nav-item
                            v-for="(item,key) in tabs"
                            :key="key"
                            :to="'/admin/stations/' + entity.id + item.urlSuffix"
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
