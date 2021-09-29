<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {v4} from 'uuid';
import {maxLength, minLength, required, helpers, email} from "vuelidate/lib/validators";

const safeStr = helpers.regex('safeStr', /^[a-zA-Z0-9-]*$/)

import AlertMessage from "../alert/AlertMessage";
import NotImplemented from "../NotImplemented";
import {addStation, editStation} from "@/domains/station/api.ts";
import {getRealms} from "@/domains/realm/api.ts";

export default {
    components: {
        AlertMessage,
        NotImplemented
    },
    props: {
        stationProperty: {
            type: Object,
            default: undefined
        },
        realmLocked: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            formData: {
                name: '',
                publicKey: null,
                email: null,
                realmId: '',
                secureId: '',
                syncPublicKey: true,
                vaultPublicKeySaved: false
            },

            busy: false,

            realm: {
                items: [],
                busy: false
            }
        }
    },
    validations: {
        formData: {
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(30)
            },
            realmId: {
                required
            },
            email: {
                minLength: minLength(10),
                maxLength: maxLength(256),
                email
            },
            publicKey: {
                minLength: minLength(10),
                maxLength: maxLength(4096)
            },
            secureId: {
                required,
                safeStr,
                minLength: minLength(1),
                maxLength: maxLength(100)
            }
        }
    },
    watch: {
        publicKey(val) {
            this.formData.publicKey = val;
        }
    },
    created() {
        if(typeof this.stationProperty !== 'undefined') {
            for(let key in this.formData) {
                if(!this.stationProperty.hasOwnProperty(key)) continue;

                this.formData[key] = this.stationProperty[key];
            }
        }

        if(!this.realmLocked) {
            this.loadRealms()
        }
    },
    methods: {
        async loadRealms() {
            try {
                const response = await getRealms();
                this.realm.items = response.data;
                this.realm.busy = false;
            }  catch (e) {
                await this.$bvToast.toast(e.message);
                this.realm.busy = false;
            }
        },
        async submit () {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.busy = true;

            try {
                let station;
                if(this.isEditing) {
                    station = await editStation(this.stationProperty.id, this.formData);

                    this.$bvToast.toast('The station was successfully updated.', {
                        variant: 'success',
                        toaster: 'b-toaster-top-center'
                    });

                    this.$emit('updated', station);
                } else {
                    station = await addStation(this.formData);

                    this.$emit('created', station);

                    this.$bvToast.toast('The station was successfully created.', {
                        variant: 'success',
                        toaster: 'b-toaster-top-center'
                    });
                }

                for(let key in this.formData) {
                    if(station.hasOwnProperty(key)) {
                        this.formData[key] = station[key];
                    }
                }
            } catch (e) {
                this.$bvToast.toast(e.message, {
                    variant: 'danger',
                    toaster: 'b-toaster-top-center'
                });

                this.$emit('failed', e.message);
            }

            this.busy = false;
        },

        generateSecureId() {
            this.formData.secureId = v4();
        },
        resetSecureId() {
            this.formData.secureId = this.stationProperty.secureId;
        },

        handleRealmChanged() {
            if(this.$v.formData.name && this.$v.formData.name.length > 0) return;

            const index = this.realm.items.findIndex(realm => realm.id === this.$v.formData.realmId.$model);
            if(index !== -1) {
                this.formData.name = this.realm.items[index].name;
            }
        }
    },
    computed: {
        isEditing() {
            return typeof this.stationProperty?.id === 'number';
        },
        publicKey() {
            return this.stationProperty.publicKey;
        },
        secureIdChanged() {
            if(typeof this.stationProperty?.secureId === 'undefined') {
                return false;
            }

            return this.stationProperty.secureId !== this.formData.secureId;
        }
    }
}
</script>
<template>
    <div>
        <div class="form-group">
            <div v-if="!realmLocked" class="form-group" :class="{ 'form-group-error': $v.formData.realmId.$error }">
                <label>Realm</label>
                <select
                    v-model="$v.formData.realmId.$model"
                    class="form-control"
                    :disabled="realm.busy"
                    @change="handleRealmChanged"
                >
                    <option value="">--- Please select ---</option>
                    <option v-for="(item,key) in realm.items" :value="item.id" :key="key">{{ item.name }}</option>
                </select>

                <div v-if="!$v.formData.realmId.required && !$v.formData.realmId.$model" class="form-group-hint group-required">
                    Please select a realm...
                </div>
            </div>

            <div v-if="!realmLocked" class="form-group" :class="{ 'form-group-error': $v.formData.name.$error }">
                <label>Name</label>
                <input v-model="$v.formData.name.$model" type="text" name="name" class="form-control" placeholder="Name...">

                <div v-if="!$v.formData.name.required" class="form-group-hint group-required">
                    Please enter a name.
                </div>
                <div v-if="!$v.formData.name.minLength" class="form-group-hint group-required">
                    The length of the name must be greater than <strong>{{ $v.formData.name.$params.minLength.min }}</strong> characters.
                </div>
                <div v-if="!$v.formData.name.maxLength" class="form-group-hint group-required">
                    The length of the name must be less than<strong>{{ $v.formData.name.$params.maxLength.max }}</strong> characters.
                </div>
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.formData.secureId.$error }">
                <label>SecureID</label>
                <input v-model="$v.formData.secureId.$model" type="text" name="name" class="form-control" placeholder="Secure ID...">

                <div v-if="!$v.formData.secureId.required" class="form-group-hint group-required">
                    Please enter a secure identifier.
                </div>
                <div v-if="!$v.formData.secureId.minLength" class="form-group-hint group-required">
                    The length of the secure identifier must be greater than <strong>{{ $v.formData.secureId.$params.minLength.min }}</strong> characters.
                </div>
                <div v-if="!$v.formData.secureId.maxLength" class="form-group-hint group-required">
                    The length of the secure identifier must be less than <strong>{{ $v.formData.secureId.$params.maxLength.max }}</strong> characters.
                </div>
                <div v-if="!$v.formData.secureId.safeStr" class="form-group-hint group-required">
                    The secure identifier is only allowed to consist of the following characters: [0-9a-zA-Z-]+
                </div>
            </div>

            <div class="alert alert-sm" :class="{'alert-danger': secureIdChanged, 'alert-info': !secureIdChanged}">
                <div class="mb-1">
                    <template v-if="secureIdChanged">
                        If you change the Secure ID, a new representation for the station will be created in Harbor & Vault.
                    </template>
                    <template v-else>
                        If you don't want to chose a secure identifier by your own, you can generate one.
                    </template>
                </div>
                <button class="btn btn-dark btn-xs" @click.prevent="generateSecureId">
                    <i class="fa fa-wrench"></i> Generate
                </button>
                <button class="btn btn-dark btn-xs" v-if="secureIdChanged" @click.prevent="resetSecureId">
                    <i class="fa fa-undo"></i> Reset
                </button>
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.formData.publicKey.$error }">
                <label>PublicKey</label>
                <textarea
                    v-model="$v.formData.publicKey.$model"
                    class="form-control"
                    rows="4"
                    placeholder="Provide a public key for the station. The public key will also be passed to the Vault Key Storage for further usage."
                ></textarea>

                <div v-if="!$v.formData.publicKey.minLength" class="form-group-hint group-required">
                    The length of the public key must be greater than <strong>{{ $v.formData.publicKey.$params.minLength.min }}</strong> characters.
                </div>
                <div v-if="!$v.formData.publicKey.maxLength" class="form-group-hint group-required">
                    The length of the public key must be less than <strong>{{ $v.formData.publicKey.$params.maxLength.max }}</strong> characters.
                </div>
            </div>

            <div class="d-flex mb-2">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="formData.syncPublicKey" id="sync-public-key" required>
                    <label class="form-check-label" for="sync-public-key">
                        Push public key to Vault?
                    </label>
                </div>
                <div class="ml-auto">
                    Pushed: <i class="fa" :class="{'fa-check text-success': formData.vaultPublicKeySaved, 'fa-times text-danger': !formData.vaultPublicKeySaved}" />
                </div>
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.formData.email.$error }">
                <label>E-Mail</label>
                <input v-model="$v.formData.email.$model" type="text" name="name" class="form-control" placeholder="E-Mail...">

                <div v-if="!$v.formData.email.minLength" class="form-group-hint group-required">
                    The length of the e-mail address must be greater than <strong>{{ $v.formData.email.$params.minLength.min }}</strong> characters.
                </div>
                <div v-if="!$v.formData.email.maxLength" class="form-group-hint group-required">
                    The length of the e-mail address must be less than <strong>{{ $v.formData.email.$params.maxLength.max }}</strong> characters.
                </div>
                <div v-if="!$v.formData.email.email" class="form-group-hint group-required">
                    The e-mail address is not valid.
                </div>
            </div>

            <hr>

            <div class="form-group">
                <button type="submit" class="btn btn-outline-primary btn-sm" :disabled="$v.$invalid || busy" @click.prevent="submit">
                    {{ isEditing ? 'Update' : 'Create' }}
                </button>
            </div>
        </div>
    </div>
</template>
<style>
.list-group-item {
    padding: .45rem .65rem;
}
</style>
