<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
export default {
    props: {
        realm: Object
    }
}
</script>
<template>
    <div class="row">
        <div class="col">
            <h6><i class="fa fa-city"></i> Station</h6>
            <p>
                You can create a station and associate it to the current realm. <br />
                This realm can than be the target for example of a proposal or a train.
            </p>
            <nuxt-link :to="'/admin/realms/'+realm.id+'/station'" class="btn btn-xs btn-dark">
                Manage
            </nuxt-link>
        </div>
        <div class="col">
            <h6><i class="fa fa-boxes"></i> Provider(s)</h6>

            <p>
                To authenticate as a user of this realm, without local authentication (name/password) against the local database,
                you have to link an authentication provider.<br />
                For example you can add an Open ID client like Keycloak.
            </p>

            <nuxt-link :to="'/admin/realms/'+realm.id+'/oauth-providers'" class="btn btn-xs btn-dark">
                Manage
            </nuxt-link>

        </div>


        <hr />
    </div>
</template>
