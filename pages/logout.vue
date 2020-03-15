<script>
import { mapActions } from 'vuex'

export default {
  created () {
    this.doLogout()
  },
  methods: {
    ...mapActions('auth', [
      'logout',
      'triggerAuthError'
    ]),

    doLogout () {
      this.logout();
      this.$nuxt.$router.push('login');
    }
  }
}
</script>
<template>
  <div />
</template>
