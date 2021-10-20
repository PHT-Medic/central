<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {addAPIProvider, editAPIProvider, getAPIRealms, OAuth2Provider} from "@personalhealthtrain/ui-common";
import {maxLength, minLength, required} from "vuelidate/lib/validators";

import AlertMessage from "../../../alert/AlertMessage";
import NotImplemented from "../../../NotImplemented";
import {clearObjectProperties} from "../../../../modules/utils.ts";

export default {
    name: 'ProviderForm',
    components: {
        AlertMessage,
        NotImplemented
    },
    props: {
        provider: {
            type: Object,
            default: {}
        },
        realmId: {
            type: String | Number,
            default: null
        }
    },
    data() {
        return {
            formData: {
                name: '',
                openId: false,
                token_host: '',
                token_path: '',
                authorize_host: '',
                authorize_path: '',
                scope: '',
                client_id: '',
                client_secret: '',
                realm_id: ''
            },

            schemes: [
                {
                    id: 'oauth2',
                    name: 'OAuth2'
                },
                {
                    id: 'openid',
                    name: 'Open ID'
                }
            ],
            realm: {
                items: [],
                busy: false
            },

            busy: false,
            message: null
        }
    },
    validations: {
        formData: {
            name: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(30)
            },
            openId: {
                required
            },
            token_host: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(512),
            },
            token_path: {
                minLength: minLength(5),
                maxLength: maxLength(256),
            },
            authorize_host: {
                minLength: minLength(5),
                maxLength: maxLength(512),
            },
            authorize_path: {
                minLength: minLength(5),
                maxLength: maxLength(256),
            },
            scope: {
                minLength: minLength(3),
                maxLength: maxLength(512),
            },
            client_id: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(128),
            },
            client_secret: {
                minLength: minLength(3),
                maxLength: maxLength(128),
            },
            realm_id: {
                required
            }
        }
    },
    created() {
        if(this.realmId) {
            this.formData.realm_id = this.realmId;
        }

        for(let key in this.formData) {
            if(this.provider.hasOwnProperty(key)) {
                this.formData[key] = this.provider[key];
            }
        }

        this.loadRealms();
    },
    methods: {
        async loadRealms() {
            this.realm.busy = true;

            try {
                const response = await getAPIRealms();
                this.realm.items = response.data;
                this.realm.busy = false;
            } catch (e) {
                this.realm.busy = false;
            }
        },
        async handleSubmit () {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.message = null;
            this.busy = true;

            try {
                let response;

                if(this.isEditing) {
                    response = await editAPIProvider(this.provider.id, clearObjectProperties(this.formData));

                    this.message = {
                        isError: false,
                        data: 'Der Provider wurde erfolgreich editiert.'
                    }

                    this.$emit('updated', response);
                } else {
                    response = await addAPIProvider(clearObjectProperties(this.formData));

                    this.message = {
                        isError: false,
                        data: 'Die Provider wurde erfolgreich erstellt.'
                    }

                    this.$emit('created', response);
                }


            } catch (e) {
                this.message = {
                    data: e.message,
                    isError: true
                }
            }

            this.busy = false;
        }
    },
    computed: {
        isEditing() {
            return typeof this.provider.id !== 'undefined';
        }
    }
}
</script>
<template>
    <div>
        <alert-message :message="message" />

        <div class="row">
            <div class="col">
                <h5><i class="fa fa-bars"></i> General</h5>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.name.$error }">
                    <label>Name</label>
                    <input v-model="$v.formData.name.$model" type="text" name="name" class="form-control" placeholder="Name...">

                    <div v-if="!$v.formData.name.required && !$v.formData.name.$model" class="form-group-hint group-required">
                        Please provide a name for the provider.
                    </div>
                    <div v-if="!$v.formData.name.minLength" class="form-group-hint group-required">
                        The length of the name must be greater than <strong>{{ $v.formData.name.$params.minLength.min }}</strong> characters.
                    </div>
                    <div v-if="!$v.formData.name.maxLength" class="form-group-hint group-required">
                        The length of the password must be less than <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> characters.
                    </div>
                </div>

                <div v-if="!realmId" class="form-group" :class="{ 'form-group-error': $v.formData.realm_id.$error }">
                    <label>Realm</label>

                    <select
                        v-model="$v.formData.realm_id.$model"
                        class="form-control"
                    >
                        <option value="">-- Bitte auswählen --</option>
                        <option v-for="(item,key) in realm.items" :value="item.id" :key="key">{{ item.name }}</option>
                    </select>

                    <div v-if="!$v.formData.realm_id.required && !$v.formData.realm_id.$model" class="form-group-hint group-required">
                        Please select a realm.
                    </div>
                </div>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.openId.$error }">
                    <label>OpenID</label>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="openIdEnabled" v-model="$v.formData.openId.$model">
                        <label class="form-check-label" for="openIdEnabled">Enabled?</label>
                    </div>

                    <div class="alert alert-info alert-sm mt-1">
                        If enabled the server will try to pull additional information from the authentication server.
                    </div>
                </div>
            </div>
            <div class="col">
                <h5><i class="fa fa-key"></i> Security</h5>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.client_id.$error }">
                    <label>Client ID</label>
                    <input v-model="$v.formData.client_id.$model" type="text" name="name" class="form-control" placeholder="Name...">

                    <div v-if="!$v.formData.client_id.required && !$v.formData.client_id.$model" class="form-group-hint group-required">
                        Please enter a client id.
                    </div>
                    <div v-if="!$v.formData.client_id.minLength" class="form-group-hint group-required">
                        The length of the client id must be greater than <strong>{{ $v.formData.name.$params.minLength.min }}</strong> characters.
                    </div>
                    <div v-if="!$v.formData.client_id.maxLength" class="form-group-hint group-required">
                        The length of the client id must be less than  <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> characters.
                    </div>
                </div>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.client_secret.$error }">
                    <label>Client Secret (optional)</label>
                    <input v-model="$v.formData.client_secret.$model" type="text" name="name" class="form-control" placeholder="Secret...">

                    <div v-if="!$v.formData.client_secret.minLength" class="form-group-hint group-required">
                        The length of the client secret must be greater than <strong>{{ $v.formData.client_secret.$params.minLength.min }}</strong> characters.
                    </div>
                    <div v-if="!$v.formData.client_secret.maxLength" class="form-group-hint group-required">
                        The length of the client secret must be less than <strong>{{ $v.formData.client_secret.$params.maxLength.max }}</strong> characters.
                    </div>
                </div>
            </div>
        </div>

        <hr />

        <h5><i class="fa fa-wrench"></i> Configuration</h5>
        <div class="row">
            <div class="col">
                <div class="form-group" :class="{ 'form-group-error': $v.formData.token_host.$error }">
                    <label>Token Host</label>
                    <input v-model="$v.formData.token_host.$model" type="text" name="name" class="form-control" placeholder="https://...">

                    <div v-if="!$v.formData.token_host.required && !$v.formData.token_host.$model" class="form-group-hint group-required">
                        Please enter a token host.
                    </div>
                    <div v-if="!$v.formData.token_host.minLength" class="form-group-hint group-required">
                        The length of the token host must be greater than <strong>{{ $v.formData.token_host.$params.minLength.min }}</strong> characters.
                    </div>
                    <div v-if="!$v.formData.token_host.maxLength" class="form-group-hint group-required">
                        The length of the token host must be less than  <strong>{{ $v.formData.token_host.$params.maxLength.max }}</strong> characters.
                    </div>
                </div>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.token_path.$error }">
                    <label>Token Path (optional) <small class="text-success">default: "oauth/token"</small></label>
                    <input v-model="$v.formData.token_path.$model" type="text" name="name" class="form-control" placeholder="path/...">

                    <div v-if="!$v.formData.token_path.minLength" class="form-group-hint group-required">
                        The length of the token path must be greater than  <strong>{{ $v.formData.token_path.$params.minLength.min }}</strong> characters.
                    </div>
                    <div v-if="!$v.formData.token_path.maxLength" class="form-group-hint group-required">
                        The length of the password must be less than <strong>{{ $v.formData.token_path.$params.maxLength.max }}</strong> characters.
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="form-group" :class="{ 'form-group-error': $v.formData.authorize_host.$error }">
                    <label>Authorization Host (optional) <small class="text-success">default: Token Host</small></label>
                    <input v-model="$v.formData.authorize_host.$model" type="text" name="name" class="form-control" placeholder="https://...">

                    <div v-if="!$v.formData.authorize_host.minLength" class="form-group-hint group-required">
                        The length of the authorization host must be greater than <strong>{{ $v.formData.token_host.$params.minLength.min }}</strong> characters.
                    </div>
                    <div v-if="!$v.formData.authorize_host.maxLength" class="form-group-hint group-required">
                        The length of the authorization host must be less than  <strong>{{ $v.formData.authorize_host.$params.maxLength.max }}</strong> characters.
                    </div>
                </div>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.authorize_path.$error }">
                    <label>Authorization Path (optional) <small class="text-success">default: "oauth/authorize"</small></label>
                    <input v-model="$v.formData.authorize_path.$model" type="text" name="name" class="form-control" placeholder="path/...">

                    <div v-if="!$v.formData.authorize_path.minLength" class="form-group-hint group-required">
                        The length of the authorization path must be greater than  <strong>{{ $v.formData.authorize_path.$params.minLength.min }}</strong> characters.
                    </div>
                    <div v-if="!$v.formData.authorize_path.maxLength" class="form-group-hint group-required">
                        The length of the authorization path must be less than  <strong>{{ $v.formData.authorize_path.$params.maxLength.max }}</strong> characters.
                    </div>
                </div>
            </div>
        </div>

        <hr />

        <div class="form-group">
            <button type="submit" class="btn btn-outline-primary btn-sm" :disabled="$v.$invalid || busy" @click.prevent="handleSubmit">
                {{ isEditing ? 'Update' : 'Create' }}
            </button>
        </div>
    </div>
</template>
<style>
.list-group-item {
    padding: .45rem .65rem;
}
</style>
