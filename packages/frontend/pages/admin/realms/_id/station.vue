<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {getAPIStations, Realm} from "@personalhealthtrain/ui-common";
import Vue from 'vue';
import StationForm from "../../../../components/station/StationForm";

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
                    { name: 'General', urlSuffix: '', icon: 'fa fa-info-circle', stationRequired: false },
                    { name: 'Registry', urlSuffix: '/registry', icon: 'fas fa-folder-open', stationRequired: true },
                    { name: 'Vault', urlSuffix: '/vault', icon: 'fa fa-key', stationRequired: true},
                ]
            },
            station: undefined,
            busy: false,
        }
    },
    async asyncData(ctx) {
        try {
            const {data: stations} = await getAPIStations( {
                filter: {
                    realm_id: ctx.params.id
                },
                fields: {
                    station: [
                        '+registry_project_id',
                        'registry_project_account_name',
                        'registry_project_account_token',
                        'registry_project_webhook_exists',
                        'vault_public_key_saved',
                        'public_key',
                        'email',
                        'secure_id'
                    ]
                }
            });

            if(stations.length !== 1) {
                return {
                    station: undefined
                };
            }

            return {
                station: stations[0]
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
        handleDeleted() {
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
