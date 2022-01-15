<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { mapActions, mapGetters } from 'vuex';
import { maxLength, minLength, required } from 'vuelidate/lib/validators';
import MedicineWorker from '../components/svg/MedicineWorker';
import { LayoutKey, LayoutNavigationID } from '../config/layout/contants';
import ProviderList from '../components/domains/auth/provider/ProviderList';

export default {
    components: { ProviderList, MedicineWorker },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_OUT]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
    },
    data() {
        return {
            provider: {
                items: [],
                busy: false,
                meta: {
                    limit: 10,
                    offset: 0,
                    total: 0,
                },
            },
            error: null,
            busy: false,
            formData: {
                name: '',
                password: '',
            },
        };
    },
    validations: {
        formData: {
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(255),
            },
            password: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(255),
            },
        },
    },
    computed: {
        ...mapGetters('auth', [
            'loggedIn',
        ]),

        providerQuery() {
            return {
                include: {
                    realm: true,
                },
                filter: {
                    realm_id: {
                        operator: '!',
                        value: 'master',
                    },
                },
                sort: {
                    created_at: 'DESC',
                },
            };
        },
    },
    methods: {
        ...mapActions('auth', [
            'triggerLogin',
        ]),

        async submit() {
            if (this.busy) return;

            this.busy = true;
            this.error = null;

            try {
                const { name, password } = this.formData;

                await this.triggerLogin({ name, password });

                await this.$nuxt.$router.push(this.$nuxt.$router.history.current.query.redirect || '/');
            } catch (e) {
                console.log(e);
                this.error = e.message;
            }

            this.busy = false;
        },

        setProviderAuthorizeURL(provider) {
            provider.url = this.$authApi.oauth2Provider.getAuthorizeUri(this.$config.apiUrl, provider.id);
            return provider;
        },
    },
};
</script>
<template>
    <div class="container">
        <h4>
            Login
        </h4>

        <div class="text-center">
            <medicine-worker
                :width="400"
                height="auto"
            />
        </div>

        <div class="row mt-3">
            <div class="col-12 col-sm-6 mb-sm-0 mb-3">
                <h6 class="title">
                    Master Realm
                </h6>

                <transition name="slide-fade">
                    <div
                        v-if="error"
                        class="alert alert-danger alert-sm"
                    >
                        {{ error }}
                    </div>
                </transition>

                <form @submit.prevent="submit">
                    <div
                        class="form-group"
                        :class="{ 'form-group-error': $v.formData.name.$error }"
                    >
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

                        <div
                            v-if="!$v.formData.name.required && !$v.formData.name.$model"
                            class="form-group-hint group-required"
                        >
                            Please enter a username or email address.
                        </div>
                        <div
                            v-if="!$v.formData.name.minLength"
                            class="form-group-hint group-required"
                        >
                            The length of the name must be greater than <strong>{{ $v.formData.name.$params.minLength.min }}</strong> characters.
                        </div>
                        <div
                            v-if="!$v.formData.name.maxLength"
                            class="form-group-hint group-required"
                        >
                            The length of the name must be less than <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> characters.
                        </div>
                    </div>

                    <div
                        class="form-group"
                        :class="{ 'form-group-error': $v.formData.password.$error }"
                    >
                        <label for="password">Password</label>
                        <input
                            id="password"
                            v-model="$v.formData.password.$model"
                            class="form-control"
                            type="password"
                            placeholder="password"
                            required
                        >

                        <div
                            v-if="!$v.formData.password.required && !$v.formData.password.$model"
                            class="form-group-hint group-required"
                        >
                            Please enter a password.
                        </div>
                        <div
                            v-if="!$v.formData.password.minLength"
                            class="form-group-hint group-required"
                        >
                            The length of the password must be greater than <strong>{{ $v.formData.name.$params.minLength.min }}</strong> characters.
                        </div>
                        <div
                            v-if="!$v.formData.password.maxLength"
                            class="form-group-hint group-required"
                        >
                            The length of the password must be less than <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> characters.
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            class="btn btn-primary btn-sm"
                            :disabled="$v.formData.$invalid || busy"
                            @click.prevent="submit"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
            <div
                class="col-12 col-sm-6"
                title="Station"
            >
                <h6 class="title">
                    Station Realms
                </h6>

                <provider-list
                    :query="providerQuery"
                    :with-search="false"
                    :map-items="setProviderAuthorizeURL"
                >
                    <template #header-title>
                        <span />
                    </template>
                    <template #items="props">
                        <ul class="list-unstyled">
                            <li
                                v-for="(item,key) in props.items"
                                :key="key"
                                class="mb-1"
                            >
                                <div class="card-header">
                                    <div class="d-flex flex-wrap flex-row">
                                        <div>
                                            <strong>{{ item.realm.name }}</strong> - {{ item.name }}
                                        </div>
                                        <div class="ml-auto">
                                            <a
                                                :href="item.url"
                                                type="button"
                                                class="btn btn-success btn-xs"
                                            >
                                                Login
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </template>
                </provider-list>
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
