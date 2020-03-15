<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  meta: {
    requiresGuestState: true
  },
  data () {
    return {
      name: '',
      password: ''
    }
  },
  computed: {
    ...mapGetters('auth', [
      'loggedIn',
      'authenticationErrorCode',
      'authenticationErrorMessage'
    ])
  },
  methods: {
    ...mapActions('auth', [
      'login',
      'triggerAuthError'
    ]),

    async handleSubmit (e) {
      e.preventDefault();

      if (this.name !== '' && this.password !== '') {
        const success = await this.login({ name: this.name, password: this.password });
        if (success) {
          this.$nuxt.$router.push(this.$nuxt.$router.history.current.query.redirect || '/');
        }
      } else {
        this.triggerAuthError('Es muss ein Benutzername und ein Passwort angegeben werden.')
      }
    }
  }
}
</script>
<template>
  <div class="text-left">
    <h4 class="title">
      Login
    </h4>
    <div v-if="authenticationErrorMessage !== ''" class="alert alert-danger alert-sm">
      {{ authenticationErrorMessage }}
    </div>
    <form>
      <div class="form-group">
        <label for="name">Name</label>
        <input
          id="name"
          v-model="name"
          class="form-control"
          type="text"
          placeholder="Benutzername oder E-mail"
          required
          autofocus
        >
      </div>
      <div class="form-group">
        <label for="password">Passwort</label>
        <input
          id="password"
          v-model="password"
          class="form-control"
          type="password"
          placeholder="Passwort"
          required
        >
      </div>
      <div>
        <button type="submit" class="btn btn-outline-primary btn-sm" @click="handleSubmit">
          Login
        </button>
      </div>
    </form>
  </div>
</template>
