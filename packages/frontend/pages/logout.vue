<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { mapActions } from 'vuex'
import {LayoutKey, LayoutNavigationID} from "../config/layout/contants";

export default {
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT
    },
    created () {
        this.doLogout();

        //setTimeout(this.doLogout,0);
    },
    methods: {
        async doLogout () {
            await this.$store.dispatch('auth/triggerLogout');

            let query = {};
            if(this.$route.query && this.$route.query.hasOwnProperty('redirect')) {
                query.redirect = this.$route.query.redirect;
            }

            await this.$router.push({path: '/login', query});
        }
    }
}
</script>
<template>
    <div />
</template>
