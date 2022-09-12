<!--
  Copyright (c) 2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PropType } from 'vue';
import { Realm } from '@authelion/common';
import { PermissionID } from '@personalhealthtrain/central-common';

export default {
    props: {
        entity: Object as PropType<Realm>,
    },
    computed: {
        canManageStations() {
            return this.$auth.has([
                PermissionID.STATION_EDIT,
                PermissionID.STATION_DROP,
                PermissionID.STATION_EDIT,
            ]);
        },
        canManageProviders() {
            return this.$auth.has([
                PermissionID.PROVIDER_ADD,
                PermissionID.PROVIDER_EDIT,
                PermissionID.PROVIDER_DROP,
            ]);
        },
    },

};
</script>
<template>
    <div class="row">
        <div
            v-if="canManageStations"
            class="col"
        >
            <h6><i class="fa fa-city" /> Station</h6>
            <p>
                Create one or more stations and associate them to the realm. <br>
                Those stations can be targeted by a proposal or train, if they are not marked as <strong>hidden</strong>.
            </p>
            <nuxt-link
                :to="'/settings/realm/stations'"
                class="btn btn-xs btn-dark"
            >
                Manage
            </nuxt-link>
        </div>
        <div
            v-if="canManageProviders"
            class="col"
        >
            <h6><i class="fa fa-boxes" /> Provider(s)</h6>

            <p>
                To authenticate as a user of this realm, without local authentication (name/password) against the local database,
                you have to link an authentication provider.<br>
                For example you can add an Open ID client like Keycloak.
            </p>

            <nuxt-link
                :to="'/settings/realm/providers'"
                class="btn btn-xs btn-dark"
            >
                Manage
            </nuxt-link>
        </div>
    </div>
</template>
