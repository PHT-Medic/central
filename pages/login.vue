<script>
    import { mapGetters, mapActions } from 'vuex'
    import {getProviders} from "@/domains/provider/api.ts";

    export default {
        meta: {
            requireGuestState: true
        },
        data () {
            return {
                provider: {
                    items: [],
                    busy: false
                },
                error: null,
                credentials: {
                    name: '',
                    password: '',
                    provider: 'master-database'
                }
            }
        },
        computed: {
            ...mapGetters('auth', [
                'loggedIn'
            ]),

            providerItems() {
                return this.provider.items.map((provider) => {
                    provider.authorizeUrl = this.$config.apiUrl + '/auth/providers/' + provider.id + '/uri';
                    return provider;
                });
            },
            masterRealmProviders() {
                return this.providerItems
                    .filter((provider) => {
                        return provider.realm.id === 'master';
                    });
            },
            stationRealmsProviders() {
                return this.providerItems.filter((provider) => {
                    return provider.realm.id !== 'master';
                })
            }
        },
        created() {
            this.loadProviders().then(r => r);
        },
        methods: {
            ...mapActions('auth', [
                'triggerLogin'
            ]),

            async loadProviders() {
                this.provider.busy = true;

                try {
                    const providers = await getProviders();

                    this.provider.busy = false;
                    this.provider.items = providers;
                } catch (e) {
                    this.provider.busy = false;
                }
            },

            async handleSubmit () {
                if (this.credentials.name === '' && this.credentials.password === '') {
                    this.error = 'Es muss ein Benutzername und ein Passwort angegeben werden.';
                    return;
                }

                this.error = null;

                try {
                    let {name, password, provider} = this.credentials;

                    if(provider === 'mater-database') {
                        provider = '';
                    }

                    await this.triggerLogin({name, password, provider});

                    await this.$nuxt.$router.push(this.$nuxt.$router.history.current.query.redirect || '/');
                } catch (e) {
                    console.log(e);
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
                            <option value="master-database">master-database</option>
                            <option v-for="(item,key) in masterRealmProviders" :value="item.id" :key="key">{{ item.name }}</option>
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
                <ul class="list-unstyled">
                    <li v-for="(item,key) in stationRealmsProviders" :key="key">
                        <div class="card-header">
                            <div class="d-flex flex-wrap flex-row">
                                <div>
                                    <strong>Realm</strong> {{item.realm.name}}
                                </div>
                                <div class="ml-auto">
                                    <a :href="item.authorizeUrl" type="button" class="btn btn-success btn-xs">
                                        Login
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <template v-if="item.realm.description">
                                {{item.realm.description}}
                            </template>
                            <template v-else>
                                <i>keine Beschreibung vorhanden</i>
                            </template>
                        </div>
                    </li>
                </ul>
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
