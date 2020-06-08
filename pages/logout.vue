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
      this.$nuxt.$router.push('login');
    }
  }
}
</script>
<template>
  <div />
</template>
