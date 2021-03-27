<script>
    import { mapGetters, mapActions } from 'vuex'
    import {getProviders} from "@/domains/provider/api.ts";
    import MedicineWorker from "@/components/svg/MedicineWorker";
    import Pagination from "@/components/Pagination";

    export default {
        components: {Pagination, MedicineWorker},
        meta: {
            requireGuestState: true
        },
        data () {
            return {
                provider: {
                    items: [],
                    busy: false,
                    meta: {
                        limit: 10,
                        offset: 0,
                        total: 0
                    }
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
                    let record = {
                        page: {
                            limit: this.provider.meta.limit,
                            offset: this.provider.meta.offset
                        }
                    };

                    const response = await getProviders(record);

                    this.provider.items = response.data;
                    const {total} = response.meta;

                    this.provider.meta.total = total;
                } catch (e) {
                    console.log(e);
                }

                this.provider.busy = false;
            },
            goTo(options, resolve, reject) {
                if(options.offset === this.provider.meta.offset) return;

                this.provider.meta.offset = options.offset;

                this.loadProviders()
                    .then(resolve)
                    .catch(reject);
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

        <div class="text-center">
            <medicine-worker :width="400" height="auto" />
        </div>

        <div class="row mt-3">
            <div class="col-12 col-sm-6 mb-sm-0 mb-3">
                <h6 class="title">
                    Master Realm
                </h6>

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
                            placeholder="username or e-mail"
                            required
                            autofocus
                        >
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input
                            id="password"
                            v-model="credentials.password"
                            class="form-control"
                            type="password"
                            placeholder="password"
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
                            <option value="master-database">database</option>
                            <option v-for="(item,key) in masterRealmProviders" :value="item.id" :key="key">{{ item.name }}</option>
                        </select>
                    </div>

                    <div>
                        <button type="submit" class="btn btn-outline-primary btn-sm" @click.prevent="handleSubmit">
                            Login
                        </button>
                    </div>
                </form>
            </div>
            <div class="col-12 col-sm-6" title="Station">
                <h6 class="title">
                    Station Realms
                </h6>
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
                                <i>No description available...</i>
                            </template>
                        </div>
                    </li>
                </ul>
                <div v-if="!provider.busy && provider.items.length === 0" class="alert alert-sm alert-info">
                    No authentication provider specified for any station.
                </div>
                <pagination :total="provider.meta.total" :offset="provider.meta.offset" :limit="provider.meta.limit" @to="goTo" />
            </div>
        </div>
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
