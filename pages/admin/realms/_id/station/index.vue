<script>
import StationForm from "@/components/station/StationForm";
import {dropStation} from "@/domains/station/api";

export default {
    props: {
        realm: Object,
        station: Object
    },
    components: {StationForm},
    data() {
        return {
            busy: false,
            data: {
                realmId: undefined,
                realm: undefined,
                name: '',
                publicKey: ''
            }
        }
    },
    created() {
        console.log(this.realm);

        this.data.realmId = this.realm.id;
        this.data.realm = this.realm;
        this.data.name = this.realm.name;
    },
    methods: {
        async dropStation() {
            if(this.busy || !this.station) return;

            this.busy = true;

            try {
                await dropStation(this.station.id);

                this.data.publicKey = '';
                delete this.data.id;

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
                    The <strong>station: {{station.name}} (ID {{station.id}})</strong> is associated to the <strong>realm: {{realm.name}} (ID {{realm.id}})</strong>.
                </p>

                <button class="btn btn-danger btn-xs" @click.prevent="dropStation">
                    <i class="fa fa-trash"></i> Delete
                </button>

                <hr />

                <station-form  :station-property="station" @created="handleCreated" @updated="handleUpdated" :realm-locked="true"/>
            </div>
        </template>
        <template v-else>
            <div class="alert alert-info alert-sm">
                No station is created for the realm <strong>{{realm.name}}</strong> yet.
            </div>

            <station-form  :station-property="data" @created="handleCreated" @updated="handleUpdated" :realm-locked="true"/>
        </template>
    </div>
</template>
