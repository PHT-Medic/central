<script>
    import { mapGetters, mapActions } from 'vuex'

    export default {
        meta: {
            requireGuestState: true
        },
        data () {
            return {
                error: null,
                credentials: {
                    name: '',
                    password: '',
                    provider: 'keycloak'
                },
                providers: [
                    {id: 'keycloak', name: 'Keycloak Authentication Provider (KAP)'},
                    {id: 'default', name: 'Default Authentication Provider (DAP)'}
                ]
            }
        },
        computed: {
            ...mapGetters('auth', [
                'loggedIn'
            ])
        },
        methods: {
            ...mapActions('auth', [
                'triggerLogin'
            ]),

            async handleSubmit () {
                if (this.credentials.name === '' && this.credentials.password === '') {
                    this.error = 'Es muss ein Benutzername und ein Passwort angegeben werden.';
                    return;
                }

                this.error = null;

                try {
                    await this.triggerLogin(this.credentials);

                    await this.$nuxt.$router.push(this.$nuxt.$router.history.current.query.redirect || '/');
                } catch (e) {
                    this.error = e.message;
                }
            }
        }
    }
</script>
<template>
    <div class="container">
        <h4 class="title">
            Login
        </h4>

        <hr />

        <b-tabs content-class="mt-3">
            <b-tab title="Local" active>
                <transition name="slide-fade">
                    <div v-if="error" class="alert alert-danger alert-sm">
                        {{ error }}
                    </div>
                </transition>

                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input
                            id="name"
                            v-model="credentials.name"
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
                            v-model="credentials.password"
                            class="form-control"
                            type="password"
                            placeholder="Passwort"
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label for="authenticationProvider">LAP <small>Local Authentication Provider</small></label>
                        <select
                            v-model="credentials.provider"
                            id="authenticationProvider"
                            class="form-control"
                        >
                            <option v-for="(item,key) in providers" :value="item.id" :key="key">{{ item.name }}</option>
                        </select>
                    </div>

                    <div>
                        <button type="submit" class="btn btn-outline-primary btn-sm" @click.prevent="handleSubmit">
                            Login
                        </button>
                    </div>
                </form>
            </b-tab>
            <b-tab title="Station">

            </b-tab>
        </b-tabs>
    </div>
</template>
<style>
.slide-fade-enter-active {
    transition: all .6s ease;
}
.slide-fade-leave-active {
    transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active below version 2.1.8 */ {
    transform: translateX(10px);
    opacity: 0;
}
</style>
