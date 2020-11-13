<script>
import { mapActions } from 'vuex'

export default {
    created () {
        this.doLogout()
    },
    methods: {
        ...mapActions('auth', [
            'triggerLogout',
            'triggerAuthError'
        ]),

        doLogout () {
            this.triggerLogout();

            let query = {};
            if(this.$route.query && this.$route.query.hasOwnProperty('redirect')) {
                query.redirect = this.$route.query.redirect;
            }

            this.$router.push({path: '/login', query});
        }
    }
}
</script>
<template>
    <div />
</template>
