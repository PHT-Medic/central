<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    addAPIStation, createNanoID, editAPIStation,
    getAPIRealms,
} from '@personalhealthtrain/ui-common';
import {
    email, helpers, maxLength, minLength, required,
} from 'vuelidate/lib/validators';

const safeStr = helpers.regex('safeStr', /^[a-z0-9]*$/);

export default {
    props: {
        stationProperty: {
            type: Object,
            default: undefined,
        },
        realmLocked: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            formData: {
                name: '',
                public_key: null,
                email: null,
                realm_id: '',
                secure_id: '',
                sync_public_key: true,
                vault_public_key_saved: false,
            },

            busy: false,

            realm: {
                items: [],
                busy: false,
            },
        };
    },
    validations: {
        formData: {
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(30),
            },
            realm_id: {
                required,
            },
            email: {
                minLength: minLength(10),
                maxLength: maxLength(256),
                email,
            },
            public_key: {
                minLength: minLength(10),
                maxLength: maxLength(4096),
            },
            secure_id: {
                required,
                safeStr,
                minLength: minLength(1),
                maxLength: maxLength(100),
            },
        },
    },
    computed: {
        isEditing() {
            return typeof this.stationProperty?.id === 'number';
        },
        public_key() {
            return this.stationProperty.public_key;
        },
        secure_idChanged() {
            if (typeof this.stationProperty?.secure_id === 'undefined') {
                return false;
            }

            return this.stationProperty.secure_id !== this.formData.secure_id;
        },
    },
    watch: {
        public_key(val) {
            this.formData.public_key = val;
        },
    },
    created() {
        if (typeof this.stationProperty !== 'undefined') {
            // eslint-disable-next-line no-restricted-syntax
            for (const key in this.formData) {
                if (!this.stationProperty.hasOwnProperty(key)) continue;

                this.formData[key] = this.stationProperty[key];
            }
        }

        if (!this.formData.secure_id || this.formData.secure_id.length === 0) {
            this.formData.secure_id = createNanoID();
        }

        if (!this.realmLocked) {
            this.loadRealms();
        }
    },
    methods: {
        async loadRealms() {
            try {
                const response = await getAPIRealms();
                this.realm.items = response.data;
                this.realm.busy = false;
            } catch (e) {
                await this.$bvToast.toast(e.message);
                this.realm.busy = false;
            }
        },
        async submit() {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.busy = true;

            try {
                let station;
                if (this.isEditing) {
                    station = await editAPIStation(this.stationProperty.id, this.formData);

                    this.$bvToast.toast('The station was successfully updated.', {
                        variant: 'success',
                        toaster: 'b-toaster-top-center',
                    });

                    this.$emit('updated', station);
                } else {
                    station = await addAPIStation(this.formData);

                    this.$emit('created', station);

                    this.$bvToast.toast('The station was successfully created.', {
                        variant: 'success',
                        toaster: 'b-toaster-top-center',
                    });
                }

                for (const key in this.formData) {
                    if (station.hasOwnProperty(key)) {
                        this.formData[key] = station[key];
                    }
                }
            } catch (e) {
                this.$bvToast.toast(e.message, {
                    variant: 'danger',
                    toaster: 'b-toaster-top-center',
                });

                this.$emit('failed', e.message);
            }

            this.busy = false;
        },

        generateSecureId() {
            this.formData.secure_id = createNanoID();
        },
        resetSecureId() {
            this.formData.secure_id = this.stationProperty.secure_id;
        },

        handleRealmChanged() {
            if (this.$v.formData.name && this.$v.formData.name.length > 0) return;

            const index = this.realm.items.findIndex((realm) => realm.id === this.$v.formData.realm_id.$model);
            if (index !== -1) {
                this.formData.name = this.realm.items[index].name;
            }
        },
    },
};
</script>
<template>
    <div>
        <div class="form-group">
            <div
                v-if="!realmLocked"
                class="form-group"
                :class="{ 'form-group-error': $v.formData.realm_id.$error }"
            >
                <label>Realm</label>
                <select
                    v-model="$v.formData.realm_id.$model"
                    class="form-control"
                    :disabled="realm.busy"
                    @change="handleRealmChanged"
                >
                    <option value="">
                        --- Please select ---
                    </option>
                    <option
                        v-for="(item,key) in realm.items"
                        :key="key"
                        :value="item.id"
                    >
                        {{ item.name }}
                    </option>
                </select>

                <div
                    v-if="!$v.formData.realm_id.required && !$v.formData.realm_id.$model"
                    class="form-group-hint group-required"
                >
                    Please select a realm...
                </div>
            </div>

            <div
                v-if="!realmLocked"
                class="form-group"
                :class="{ 'form-group-error': $v.formData.name.$error }"
            >
                <label>Name</label>
                <input
                    v-model="$v.formData.name.$model"
                    type="text"
                    name="name"
                    class="form-control"
                    placeholder="Name..."
                >

                <div
                    v-if="!$v.formData.name.required"
                    class="form-group-hint group-required"
                >
                    Please enter a name.
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
                    The length of the name must be less than<strong>{{ $v.formData.name.$params.maxLength.max }}</strong> characters.
                </div>
            </div>

            <div
                class="form-group"
                :class="{ 'form-group-error': $v.formData.secure_id.$error }"
            >
                <label>SecureID</label>
                <input
                    v-model="$v.formData.secure_id.$model"
                    type="text"
                    name="name"
                    class="form-control"
                    placeholder="Secure ID..."
                >

                <div
                    v-if="!$v.formData.secure_id.required"
                    class="form-group-hint group-required"
                >
                    Please enter a secure identifier.
                </div>
                <div
                    v-if="!$v.formData.secure_id.minLength"
                    class="form-group-hint group-required"
                >
                    The length of the secure identifier must be greater than
                    <strong>{{ $v.formData.secure_id.$params.minLength.min }}</strong> characters.
                </div>
                <div
                    v-if="!$v.formData.secure_id.maxLength"
                    class="form-group-hint group-required"
                >
                    The length of the secure identifier must be less than
                    <strong>{{ $v.formData.secure_id.$params.maxLength.max }}</strong> characters.
                </div>
                <div
                    v-if="!$v.formData.secure_id.safeStr"
                    class="form-group-hint group-required"
                >
                    The secure identifier is only allowed to consist of the following characters: [0-9a-z]+
                </div>
            </div>

            <div
                class="alert alert-sm"
                :class="{'alert-danger': secure_idChanged, 'alert-info': !secure_idChanged}"
            >
                <div class="mb-1">
                    <template v-if="secure_idChanged">
                        If you change the Secure ID, a new representation for the station will be created in Harbor & Vault.
                    </template>
                    <template v-else>
                        If you don't want to chose a secure identifier by your own, you can generate one.
                    </template>
                </div>
                <button
                    class="btn btn-dark btn-xs"
                    @click.prevent="generateSecureId"
                >
                    <i class="fa fa-wrench" /> Generate
                </button>
                <button
                    v-if="secure_idChanged"
                    class="btn btn-dark btn-xs"
                    @click.prevent="resetSecureId"
                >
                    <i class="fa fa-undo" /> Reset
                </button>
            </div>

            <div
                class="form-group"
                :class="{ 'form-group-error': $v.formData.public_key.$error }"
            >
                <label>PublicKey</label>
                <textarea
                    v-model="$v.formData.public_key.$model"
                    class="form-control"
                    rows="4"
                    placeholder="Provide a public key for the station. The public key will also be passed to the Vault Key Storage for further usage."
                />

                <div
                    v-if="!$v.formData.public_key.minLength"
                    class="form-group-hint group-required"
                >
                    The length of the public key must be greater than <strong>{{ $v.formData.public_key.$params.minLength.min }}</strong> characters.
                </div>
                <div
                    v-if="!$v.formData.public_key.maxLength"
                    class="form-group-hint group-required"
                >
                    The length of the public key must be less than <strong>{{ $v.formData.public_key.$params.maxLength.max }}</strong> characters.
                </div>
            </div>

            <div class="d-flex mb-2">
                <div class="form-check">
                    <input
                        id="sync-public-key"
                        v-model="formData.sync_public_key"
                        class="form-check-input"
                        type="checkbox"
                        required
                    >
                    <label
                        class="form-check-label"
                        for="sync-public-key"
                    >
                        Push public key to Vault?
                    </label>
                </div>
                <div class="ml-auto">
                    Pushed: <i
                        class="fa"
                        :class="{'fa-check text-success': formData.vault_public_key_saved, 'fa-times text-danger': !formData.vault_public_key_saved}"
                    />
                </div>
            </div>

            <div
                class="form-group"
                :class="{ 'form-group-error': $v.formData.email.$error }"
            >
                <label>E-Mail</label>
                <input
                    v-model="$v.formData.email.$model"
                    type="text"
                    name="name"
                    class="form-control"
                    placeholder="E-Mail..."
                >

                <div
                    v-if="!$v.formData.email.minLength"
                    class="form-group-hint group-required"
                >
                    The length of the e-mail address must be greater than <strong>{{ $v.formData.email.$params.minLength.min }}</strong> characters.
                </div>
                <div
                    v-if="!$v.formData.email.maxLength"
                    class="form-group-hint group-required"
                >
                    The length of the e-mail address must be less than <strong>{{ $v.formData.email.$params.maxLength.max }}</strong> characters.
                </div>
                <div
                    v-if="!$v.formData.email.email"
                    class="form-group-hint group-required"
                >
                    The e-mail address is not valid.
                </div>
            </div>

            <hr>

            <div class="form-group">
                <button
                    type="submit"
                    class="btn btn-outline-primary btn-sm"
                    :disabled="$v.$invalid || busy"
                    @click.prevent="submit"
                >
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
