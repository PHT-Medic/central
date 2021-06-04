<script>
import { mapActions } from 'vuex'

export default {
    created () {
        this.doLogout();

        //setTimeout(this.doLogout,0);
    },
    methods: {
        ...mapActions('auth', [
            'triggerLogout',
            'triggerAuthError'
        ]),

        async doLogout () {
            await this.triggerLogout();

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
