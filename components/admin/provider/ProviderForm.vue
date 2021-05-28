<script>
import {maxLength, minLength, required, numeric} from "vuelidate/lib/validators";

import AlertMessage from "../../alert/AlertMessage";
import NotImplemented from "../../NotImplemented";
import {addProvider, editProvider} from "@/domains/provider/api.ts";
import {getRealms} from "@/domains/realm/api.ts";
import {clearObjectProperties} from "@/modules/utils.ts";

export default {
    name: 'ProviderForm',
    components: {
        AlertMessage,
        NotImplemented
    },
    props: {
        providerProperty: {
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
                scheme: '',
                tokenHost: '',
                tokenPath: '',
                tokenRevokePath: '',
                authorizeHost: '',
                authorizePath: '',
                scope: '',
                clientId: '',
                clientSecret: '',
                realmId: ''
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
            scheme: {
                required
            },
            tokenHost: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(512),
            },
            tokenPath: {
                minLength: minLength(5),
                maxLength: maxLength(256),
            },
            tokenRevokePath: {
                minLength: minLength(5),
                maxLength: maxLength(256),
            },
            authorizeHost: {
                minLength: minLength(5),
                maxLength: maxLength(512),
            },
            authorizePath: {
                minLength: minLength(5),
                maxLength: maxLength(256),
            },
            scope: {
                minLength: minLength(3),
                maxLength: maxLength(512),
            },
            clientId: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(128),
            },
            clientSecret: {
                minLength: minLength(3),
                maxLength: maxLength(128),
            },
            realmId: {
                required
            }
        }
    },
    created() {
        this.loadRealms();

        if(this.realmId) {
            this.formData.realmId = this.realmId;
        }

        for(let key in this.formData) {
            if(this.providerProperty.hasOwnProperty(key)) {
                this.formData[key] = this.providerProperty[key];
            } else {
                this.formData[key] = '';
            }
        }
    },
    methods: {
        async loadRealms() {
            this.realm.busy = true;

            try {
                const response = await getRealms();
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
                    response = await editProvider(this.providerProperty.id, clearObjectProperties(this.formData));

                    this.message = {
                        isError: false,
                        data: 'Der Provider wurde erfolgreich editiert.'
                    }

                    this.$emit('updated', response);
                } else {
                    response = await addProvider(clearObjectProperties(this.formData));

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
            return typeof this.providerProperty.id === 'number';
        }
    }
}
</script>
<template>
    <div>
        <alert-message :message="message" />

        <div class="row">
            <div class="col">

                <h5 class="title">Allgemein</h5>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.name.$error }">
                    <label>Name</label>
                    <input v-model="$v.formData.name.$model" type="text" name="name" class="form-control" placeholder="Name...">

                    <div v-if="!$v.formData.name.required && !$v.formData.name.$model" class="form-group-hint group-required">
                        Bitte geben Sie einen Namen an.
                    </div>
                    <div v-if="!$v.formData.name.minLength" class="form-group-hint group-required">
                        Der Name muss mindestens <strong>{{ $v.formData.name.$params.minLength.min }}</strong> Zeichen lang sein.
                    </div>
                    <div v-if="!$v.formData.name.maxLength" class="form-group-hint group-required">
                        Der Name darf maximal <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> Zeichen lang sein.
                    </div>
                </div>

                <div v-if="!realmId" class="form-group" :class="{ 'form-group-error': $v.formData.realmId.$error }">
                    <label>Realm</label>

                    <select
                        v-model="$v.formData.realmId.$model"
                        class="form-control"
                    >
                        <option value="">-- Bitte auswählen --</option>
                        <option v-for="(item,key) in realm.items" :value="item.id" :key="key">{{ item.name }}</option>
                    </select>

                    <div v-if="!$v.formData.realmId.required && !$v.formData.realmId.$model" class="form-group-hint group-required">
                        Bitte geben Sie einen Realm an.
                    </div>
                </div>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.scheme.$error }">
                    <label>Schema</label>

                    <select
                        v-model="$v.formData.scheme.$model"
                        class="form-control"
                    >
                        <option value="">-- Bitte auswählen --</option>
                        <option v-for="(item,key) in schemes" :value="item.id" :key="key">{{ item.name }}</option>
                    </select>

                    <div v-if="!$v.formData.scheme.required && !$v.formData.scheme.$model" class="form-group-hint group-required">
                        Bitte geben Sie ein Schema an.
                    </div>
                </div>

                <hr>

                <h5 class="title">Sicherheitseinstellungen</h5>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.clientId.$error }">
                    <label>Client ID</label>
                    <input v-model="$v.formData.clientId.$model" type="text" name="name" class="form-control" placeholder="Name...">

                    <div v-if="!$v.formData.clientId.required && !$v.formData.name.$model" class="form-group-hint group-required">
                        Bitte geben Sie eine Client Id an.
                    </div>
                    <div v-if="!$v.formData.clientId.minLength" class="form-group-hint group-required">
                        Die Client Id muss mindestens <strong>{{ $v.formData.name.$params.minLength.min }}</strong> Zeichen lang sein.
                    </div>
                    <div v-if="!$v.formData.clientId.maxLength" class="form-group-hint group-required">
                        Die Client Id darf maximal <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> Zeichen lang sein.
                    </div>
                </div>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.clientSecret.$error }">
                    <label>Client Secret</label>
                    <input v-model="$v.formData.clientSecret.$model" type="text" name="name" class="form-control" placeholder="Name...">

                    <div v-if="!$v.formData.clientSecret.minLength" class="form-group-hint group-required">
                        Das Client Secret muss mindestens <strong>{{ $v.formData.clientSecret.$params.minLength.min }}</strong> Zeichen lang sein.
                    </div>
                    <div v-if="!$v.formData.clientSecret.maxLength" class="form-group-hint group-required">
                        Das Client Secret darf maximal <strong>{{ $v.formData.clientSecret.$params.maxLength.max }}</strong> Zeichen lang sein.
                    </div>
                </div>

                <div class="form-group">
                    <button type="submit" class="btn btn-outline-primary btn-sm" :disabled="$v.$invalid || busy" @click.prevent="handleSubmit">
                        {{ isEditing ? 'Aktualisieren' : 'Erstellen' }}
                    </button>
                </div>
            </div>
            <div class="col">
                <h5 class="title">Konfiguration</h5>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.tokenHost.$error }">
                    <label>Token Host</label>
                    <input v-model="$v.formData.tokenHost.$model" type="text" name="name" class="form-control" placeholder="https://...">

                    <div v-if="!$v.formData.tokenHost.required && !$v.formData.tokenHost.$model" class="form-group-hint group-required">
                        Bitte geben Sie einen Namen an.
                    </div>
                    <div v-if="!$v.formData.tokenHost.minLength" class="form-group-hint group-required">
                        Der Name muss mindestens <strong>{{ $v.formData.tokenHost.$params.minLength.min }}</strong> Zeichen lang sein.
                    </div>
                    <div v-if="!$v.formData.tokenHost.maxLength" class="form-group-hint group-required">
                        Der Name darf maximal <strong>{{ $v.formData.tokenHost.$params.maxLength.max }}</strong> Zeichen lang sein.
                    </div>
                </div>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.tokenPath.$error }">
                    <label>Token Pfad</label>
                    <input v-model="$v.formData.tokenPath.$model" type="text" name="name" class="form-control" placeholder="/path/...">

                    <div v-if="!$v.formData.tokenPath.minLength" class="form-group-hint group-required">
                        Der Token Pfad muss mindestens <strong>{{ $v.formData.tokenPath.$params.minLength.min }}</strong> Zeichen lang sein.
                    </div>
                    <div v-if="!$v.formData.tokenPath.maxLength" class="form-group-hint group-required">
                        Der Token Pfad darf maximal <strong>{{ $v.formData.tokenPath.$params.maxLength.max }}</strong> Zeichen lang sein.
                    </div>
                </div>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.tokenRevokePath.$error }">
                    <label>Token Revoke Pfad</label>
                    <input v-model="$v.formData.tokenRevokePath.$model" type="text" name="name" class="form-control" placeholder="/path/...">

                    <div v-if="!$v.formData.tokenRevokePath.minLength" class="form-group-hint group-required">
                        Der Token Revoke Pfad muss mindestens <strong>{{ $v.formData.tokenRevokePath.$params.minLength.min }}</strong> Zeichen lang sein.
                    </div>
                    <div v-if="!$v.formData.tokenRevokePath.maxLength" class="form-group-hint group-required">
                        Der Token Revoke Pfad darf maximal <strong>{{ $v.formData.tokenRevokePath.$params.maxLength.max }}</strong> Zeichen lang sein.
                    </div>
                </div>

                <hr />

                <div class="form-group" :class="{ 'form-group-error': $v.formData.authorizeHost.$error }">
                    <label>Authorization Host</label>
                    <input v-model="$v.formData.authorizeHost.$model" type="text" name="name" class="form-control" placeholder="https://...">

                    <div v-if="!$v.formData.authorizeHost.minLength" class="form-group-hint group-required">
                        Der Authorization Host muss mindestens <strong>{{ $v.formData.tokenHost.$params.minLength.min }}</strong> Zeichen lang sein.
                    </div>
                    <div v-if="!$v.formData.authorizeHost.maxLength" class="form-group-hint group-required">
                        Der Authorization Host darf maximal <strong>{{ $v.formData.authorizeHost.$params.maxLength.max }}</strong> Zeichen lang sein.
                    </div>
                </div>

                <div class="form-group" :class="{ 'form-group-error': $v.formData.authorizePath.$error }">
                    <label>Authorization Pfad</label>
                    <input v-model="$v.formData.authorizePath.$model" type="text" name="name" class="form-control" placeholder="/path/...">

                    <div v-if="!$v.formData.authorizePath.minLength" class="form-group-hint group-required">
                        Der Authorization Pfad muss mindestens <strong>{{ $v.formData.authorizePath.$params.minLength.min }}</strong> Zeichen lang sein.
                    </div>
                    <div v-if="!$v.formData.authorizePath.maxLength" class="form-group-hint group-required">
                        Der Authorization Pfad darf maximal <strong>{{ $v.formData.authorizePath.$params.maxLength.max }}</strong> Zeichen lang sein.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.list-group-item {
    padding: .45rem .65rem;
}
</style>
