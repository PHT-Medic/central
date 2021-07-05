<script>
    import { mapGetters, mapActions } from 'vuex'
    import {getProviderAuthorizeUri, getProviders} from "@/domains/provider/api.ts";
    import MedicineWorker from "@/components/svg/MedicineWorker";
    import Pagination from "@/components/Pagination";
    import {maxLength, minLength, required} from "vuelidate/lib/validators";

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
                busy: false,
                formData: {
                    name: '',
                    password: ''
                }
            }
        },
        validations: {
            formData: {
                name: {
                    required,
                    minLength: minLength(3),
                    maxLength: maxLength(255)
                },
                password: {
                    required,
                    minLength: minLength(3),
                    maxLength: maxLength(255)
                }
            }
        },
        computed: {
            ...mapGetters('auth', [
                'loggedIn'
            ]),

            providerItems() {
                return this.provider.items.map((provider) => {
                    provider.authorizeUrl = getProviderAuthorizeUri(provider.id);
                    return provider;
                });
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
                        },
                        filter: {
                            realmId: '!=master'
                        }
                    };

                    const response = await getProviders(record);

                    this.provider.items = response.data;
                    const {total} = response.meta;

                    this.provider.meta.total = total;
                } catch (e) {
                    // don't handle ^^ :)
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

            async submit () {
                if(this.busy) return;

                this.busy = true;
                this.error = null;

                try {
                    let {name, password} = this.formData;

                    await this.triggerLogin({name, password});

                    await this.$nuxt.$router.push(this.$nuxt.$router.history.current.query.redirect || '/');
                } catch (e) {
                    this.error = e.message;
                }

                this.busy = false;
            }
        }
    }
</script>
<template>
    <div class="container">
        <h4>
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

                <form @submit.prevent="submit">
                    <div class="form-group" :class="{ 'form-group-error': $v.formData.name.$error }">
                        <label for="name">Name</label>
                        <input
                            id="name"
                            v-model="$v.formData.name.$model"
                            class="form-control"
                            type="text"
                            placeholder="username or e-mail"
                            required
                            autofocus
                        >

                        <div v-if="!$v.formData.name.required && !$v.formData.name.$model" class="form-group-hint group-required">
                            Please enter a username or email address.
                        </div>
                        <div v-if="!$v.formData.name.minLength" class="form-group-hint group-required">
                            The length of the name must be greater than <strong>{{ $v.formData.name.$params.minLength.min }}</strong> characters.
                        </div>
                        <div v-if="!$v.formData.name.maxLength" class="form-group-hint group-required">
                            The length of the name must be less than <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> characters.
                        </div>
                    </div>

                    <div class="form-group" :class="{ 'form-group-error': $v.formData.password.$error }">
                        <label for="password">Password</label>
                        <input
                            id="password"
                            v-model="$v.formData.password.$model"
                            class="form-control"
                            type="password"
                            placeholder="password"
                            required
                        >

                        <div v-if="!$v.formData.password.required && !$v.formData.password.$model" class="form-group-hint group-required">
                            Please enter a password.
                        </div>
                        <div v-if="!$v.formData.password.minLength" class="form-group-hint group-required">
                            The length of the password must be greater than <strong>{{ $v.formData.name.$params.minLength.min }}</strong> characters.
                        </div>
                        <div v-if="!$v.formData.password.maxLength" class="form-group-hint group-required">
                            The length of the password must be less than <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> characters.
                        </div>
                    </div>

                    <div>
                        <button type="submit" class="btn btn-primary btn-sm" @click.prevent="submit" :disabled="$v.formData.$invalid || busy">
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
                    <li v-for="(item,key) in providerItems" :key="key">
                        <div class="card-header">
                            <div class="d-flex flex-wrap flex-row">
                                <div>
                                    <strong>Realm</strong> {{item.realm.name}} - {{item.name}}
                                </div>
                                <div class="ml-auto">
                                    <a :href="item.authorizeUrl" type="button" class="btn btn-success btn-xs">
                                        Login
                                    </a>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
                <div v-if="!provider.busy && providerItems.length === 0" class="alert alert-sm alert-info">
                    No authentication provider available for any station.
                </div>
                <pagination v-if="providerItems.length !== 0" :total="provider.meta.total" :offset="provider.meta.offset" :limit="provider.meta.limit" @to="goTo" />
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
