<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { Realm, Station, dropAPIStation } from '@personalhealthtrain/ui-common';
import StationForm from '../../../../../components/domains/station/StationForm';

export default {
    components: { StationForm },
    props: {
        realm: Object,
        station: Object,
    },
    data() {
        return {
            busy: false,
        };
    },
    methods: {
        handleCreated(station) {
            this.$emit('created', station);
        },
        handleUpdated(station) {
            this.$emit('updated', station);
        },
    },
};
</script>
<template>
    <div>
        <template v-if="station">
            <div>
                <h5>General</h5>
                <p class="mb-2">
                    If you remove the station association to the realm, the station will be deleted.
                </p>

                <hr>

                <station-form
                    :station-property="station"
                    :realm-locked="true"
                    @created="handleCreated"
                    @updated="handleUpdated"
                />
            </div>
        </template>
        <template v-else>
            <p class="mb-2">
                No station is associated to the  <strong>{{ realm.name }}</strong> realm yet.
            </p>

            <hr>

            <station-form
                :station-property="{realm_id: realm.id, name: realm.name}"
                :realm-locked="true"
                @created="handleCreated"
                @updated="handleUpdated"
            />
        </template>
    </div>
</template>
