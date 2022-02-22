<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import Vue from 'vue';
import StationForm from '../../../../components/domains/station/StationForm';

export default {
    components: { StationForm },
    props: {
        entity: Object,
    },
    async asyncData(context) {
        try {
            const { data: stations } = await context.$api.station.getMany({
                filter: {
                    realm_id: context.params.id,
                },
                fields: {
                    station: [
                        '+registry_project_id',
                        '+registry_project_account_id',
                        '+registry_project_account_name',
                        '+registry_project_account_token',
                        '+registry_project_webhook_exists',
                        '+vault_public_key_saved',
                        '+public_key',
                        '+email',
                        '+secure_id',
                    ],
                },
            });

            if (stations.length === 0) {
                return {
                    childEntity: undefined,
                };
            }

            return {
                childEntity: stations[0],
            };
        } catch (e) {
            return {
                childEntity: undefined,
            };
        }
    },
    data() {
        return {
            sidebar: {
                hide: false,
                items: [
                    {
                        name: 'General', urlSuffix: '', icon: 'fa fa-info-circle', stationRequired: false,
                    },
                    {
                        name: 'Registry', urlSuffix: '/registry', icon: 'fas fa-folder-open', stationRequired: true,
                    },
                    {
                        name: 'Secret Storage', urlSuffix: '/secret-storage', icon: 'fa fa-key', stationRequired: true,
                    },
                ],
            },
            childEntity: undefined,
            busy: false,
        };
    },
    mounted() {
        this.subscribeRealtimeServer();
    },
    beforeDestroy() {
        this.unsubscribeRealtimeServer();
    },
    methods: {
        subscribeRealtimeServer() {
            if (!this.childEntity) return;
            const socket = this.$socket.useRealmWorkspace(this.childEntity.realm_id);
            socket.emit('stationsSubscribe', { data: { id: this.childEntity.id } });
            socket.on('stationUpdated', this.handleSocketUpdated);
            socket.on('stationDeleted', this.handleSocketDeleted);
        },
        unsubscribeRealtimeServer() {
            if (!this.childEntity) return;

            const socket = this.$socket.useRealmWorkspace(this.childEntity.realm_id);
            socket.emit('stationsUnsubscribe', { data: { id: this.childEntity.id } });
            socket.off('stationUpdated', this.handleSocketUpdated);
            socket.off('stationDeleted', this.handleSocketDeleted);
        },

        handleSocketUpdated(context) {
            if (
                this.childEntity.id !== context.data.id ||
                context.meta.roomId !== this.childEntity.id
            ) return;

            this.handleUpdated(context.data);
        },
        async handleSocketDeleted(context) {
            if (
                this.childEntity.id !== context.data.id ||
                context.meta.roomId !== this.childEntity.id
            ) return;

            await this.handleDeleted();
        },

        handleCreated(station) {
            this.childEntity = station;
            this.subscribeRealtimeServer();
        },
        handleUpdated(station) {
            const keys = Object.keys(station);
            for (let i = 0; i < keys.length; i++) {
                Vue.set(this.childEntity, keys[i], station[keys[i]]);
            }
        },
        async handleDeleted() {
            await this.$nuxt.$router.push(`/admin/realms/${this.childEntity.realm_id}`);
        },
    },
};
</script>
<template>
    <div>
        <template v-if="childEntity">
            <div>
                <station-form
                    :entity-property="childEntity"
                    @created="handleCreated"
                    @updated="handleUpdated"
                    @deleted="handleDeleted"
                />
            </div>
        </template>
        <template v-else>
            <p class="mb-2">
                No station is associated to the  <strong>{{ entity.name }}</strong> realm yet.
            </p>

            <hr>

            <station-form
                :realm-id-property="entity.id"
                :realm-name-property="entity.name"
                @created="handleCreated"
                @updated="handleUpdated"
                @deleted="handleDeleted"
            />
        </template>
    </div>
</template>
