<script>
import Vue from 'vue';
import {doStationTask, dropStation, getStations} from "@/domains/station/api";
import StationForm from "@/components/station/StationForm";
import {getApiRealmStation} from "@/domains/realm/station/api";

export default {
    components: {StationForm},
    props: {
        realm: Object
    },
    data() {
        return {
            sidebar: {
                hide: false,
                items: [
                    { name: 'General', urlSuffix: '', componentName: 'chat-rooms-index', icon: 'fa fa-info-circle', stationRequired: false },
                    { name: 'Harbor', urlSuffix: '/harbor', componentName: 'chat-rooms-index', icon: 'fas fa-folder-open', stationRequired: true },
                    { name: 'Vault', urlSuffix: '/vault', componentName: 'chat-rooms-index-channel', icon: 'fa fa-key', stationRequired: true},
                ]
            },
            station: undefined,
            busy: false,
        }
    },
    async asyncData(ctx) {
        try {
            const station = await getApiRealmStation(ctx.params.id, {
                fields: {
                    station: [
                        'harbor_project_id',
                        'harbor_project_account_name',
                        'harbor_project_account_token',
                        'harbor_project_webhook_exists',
                        'vault_public_key_saved',
                        'public_key'
                    ]
                }
            });

            return {
                station
            }
        } catch (e) {
            return {
                station: undefined
            }
        }


    },
    methods: {
        handleCreated(station) {
            this.station = station;
        },
        handleUpdated(station) {
            for(let key in station) {
                Vue.set(this.station, key, station[key]);
            }
        },
        handleDeleted(station) {
            this.station = undefined;
        }
    }
}
</script>
<template>
    <div class="content-wrapper">
        <div class="content-sidebar">
            <b-nav pills vertical>
                <b-nav-item
                    v-if="!item.stationRequired || (item.stationRequired && station)"
                    v-for="(item,key) in sidebar.items"
                    :key="key"
                    :disabled="item.active"
                    :to="'/admin/realms/' +realm.id + '/station'+ item.urlSuffix"
                    exact
                    exact-active-class="active"
                >
                    <i :class="item.icon" />
                    {{ item.name }}
                </b-nav-item>
            </b-nav>
        </div>
        <div class="content-container">
            <nuxt-child :realm="realm" :station="station" @created="handleCreated" @updated="handleUpdated" @deleted="handleDeleted" />
        </div>
    </div>
</template>
