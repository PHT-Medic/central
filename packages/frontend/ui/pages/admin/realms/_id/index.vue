<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PropType } from 'vue';
import { Realm } from '@authelion/common';

export default {
    props: {
        entity: Object as PropType<Realm>,
    },
};
</script>
<template>
    <div class="row">
        <div class="col">
            <h6><i class="fa fa-city" /> Station</h6>
            <p>
                Create one or more stations and associate them to the current realm. <br>
                Those stations can be targeted by a proposal or train, if they are not marked as <strong>hidden</strong>.
            </p>
            <nuxt-link
                :to="'/admin/realms/'+entity.id+'/stations'"
                class="btn btn-xs btn-dark"
            >
                Manage
            </nuxt-link>
        </div>
        <div class="col">
            <h6><i class="fa fa-boxes" /> Provider(s)</h6>

            <p>
                To authenticate as a user of this realm, without local authentication (name/password) against the local database,
                you have to link an authentication provider.<br>
                For example you can add an Open ID client like Keycloak.
            </p>

            <nuxt-link
                :to="'/admin/realms/'+entity.id+'/oauth-providers'"
                class="btn btn-xs btn-dark"
            >
                Manage
            </nuxt-link>
        </div>
    </div>
</template>
