<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {dropAPIStation, Realm, Station} from "@personalhealthtrain/ui-common";
import StationForm from "../../../../../components/station/StationForm";

export default {
    props: {
        realm: Realm,
        station: Station
    },
    components: {StationForm},
    data() {
        return {
            busy: false,
        }
    },
    methods: {
        async dropStation() {
            if(this.busy || !this.station) return;

            this.busy = true;

            try {
                await dropAPIStation(this.station.id);

                this.$emit('deleted', this.station);
            } catch (e) {

            }

            this.busy = false;
        },

        handleCreated(station) {
            this.$emit('created', station);
        },
        handleUpdated(station) {
            this.$emit('updated', station);
        }
    }
}
</script>
<template>
    <div>
        <template v-if="station">
            <div>
                <h5>General</h5>
                <p class="mb-2">
                    If you remove the station association to the realm, the station will be deleted.
                </p>

                <button class="btn btn-danger btn-xs" @click.prevent="dropStation">
                    <i class="fa fa-trash"></i> Delete
                </button>

                <hr />

                <station-form  :station-property="station" @created="handleCreated" @updated="handleUpdated" :realm-locked="true"/>
            </div>
        </template>
        <template v-else>
            <p class="mb-2">
                No station is associated to the  <strong>{{realm.name}}</strong> realm yet.
            </p>

            <hr />

            <station-form :station-property="{realm_id: this.realm.id, name: this.realm.name}" @created="handleCreated" @updated="handleUpdated" :realm-locked="true"/>
        </template>
    </div>
</template>
