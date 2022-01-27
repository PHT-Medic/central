<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    RegistryCommand,
    SecretStorageCommand, buildRegistryStationProjectName, buildStationSecretStorageKey, createNanoID, isHex,
} from '@personalhealthtrain/ui-common';
import {
    email, helpers, maxLength, minLength, required,
} from 'vuelidate/lib/validators';

const safeStr = helpers.regex('safeStr', /^[a-z0-9]*$/);

export default {
    components: {},

    props: {
        entityProperty: {
            type: Object,
            default: undefined,
        },
        realmIdProperty: {
            type: String,
            default: undefined,
        },
        realmNameProperty: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            formData: {
                name: '',
                public_key: '',
                email: '',
                realm_id: '',
                secure_id: '',
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
            return this.entityProperty &&
                Object.prototype.hasOwnProperty.call(this.entityProperty, 'id');
        },
        isRealmLocked() {
            return this.realmIdProperty || (this.entityProperty && this.entityProperty.realm_id);
        },
        isHexPublicKey() {
            return this.formData.public_key && isHex(this.formData.public_key);
        },
        hasSecureIdChanged() {
            if (typeof this.entityProperty?.secure_id === 'undefined') {
                return false;
            }

            return this.entityProperty.secure_id !== this.formData.secure_id;
        },

        updatedAt() {
            return this.isEditing ? this.entityProperty.updated_at : undefined;
        },

        pathName() {
            return this.formData.name ?
                buildStationSecretStorageKey(this.formData.name) :
                '';
        },
        projectName() {
            return this.formData.name ?
                buildRegistryStationProjectName(this.entityProperty.secure_id) :
                '';
        },
    },
    watch: {
        updatedAt(val, oldVal) {
            if (val && val !== oldVal) {
                this.initFromProperties();
            }
        },
    },
    created() {
        Promise.resolve()
            .then(this.initFromProperties)
            .then(this.loadRealms);
    },
    methods: {
        initFromProperties() {
            if (typeof this.entityProperty !== 'undefined') {
                const keys = Object.keys(this.formData);
                for (let i = 0; i < keys.length; i++) {
                    if (!Object.prototype.hasOwnProperty.call(this.entityProperty, keys[i])) continue;

                    this.formData[keys[i]] = this.entityProperty[keys[i]];
                }
            }

            if (
                !this.formData.realm_id &&
                this.realmIdProperty
            ) {
                this.formData.realm_id = this.realmIdProperty;
            }

            if (
                !this.formData.name &&
                (this.realmIdProperty || this.realmNameProperty)
            ) {
                this.formData.name = this.realmNameProperty || this.realmIdProperty;
            }

            if (!this.formData.secure_id) {
                this.formData.secure_id = createNanoID();
            }
        },
        async loadRealms() {
            if (this.isRealmLocked) return;

            try {
                const response = await this.$authApi.realm.getMany();
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
                    station = await this.$api.station.update(this.entityProperty.id, this.formData);

                    this.$bvToast.toast('The station was successfully updated.', {
                        variant: 'success',
                        toaster: 'b-toaster-top-center',
                    });

                    this.$emit('updated', station);
                } else {
                    station = await this.$api.station.create(this.formData);

                    this.$emit('created', station);

                    this.$bvToast.toast('The station was successfully created.', {
                        variant: 'success',
                        toaster: 'b-toaster-top-center',
                    });
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
        async drop() {
            if (this.busy || !this.isEditing) {
                return;
            }

            this.busy = true;

            try {
                const entity = await this.$api.station.delete(this.entityProperty.id);

                this.$emit('deleted', entity);

                this.$bvToast.toast('The station was successfully deleted.', {
                    variant: 'success',
                    toaster: 'b-toaster-top-center',
                });
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
            this.formData.secure_id = this.entityProperty.secure_id;
        },

        handleRealmChanged() {
            if (this.$v.formData.name && this.$v.formData.name.length > 0) return;

            const index = this.realm.items.findIndex((realm) => realm.id === this.$v.formData.realm_id.$model);
            if (index !== -1) {
                this.formData.name = this.realm.items[index].name;
            }
        },

        async runSecretStorageEngineKeySave() {
            await this.runSecretStorageCommand(SecretStorageCommand.ENGINE_KEY_SAVE);
        },
        async runSecretStorageEngineKeyDelete() {
            await this.runSecretStorageCommand(SecretStorageCommand.ENGINE_KEY_DROP);
        },
        async runSecretStorageCommand(action) {
            if (this.busy || !this.isEditing) return;

            this.busy = true;

            const title = 'Secret Storage';
            let message = 'Succeeded...';
            let variant = 'success';

            try {
                const station = await this.$api.service.runSecretStorageCommand(action, {
                    name: buildStationSecretStorageKey(this.entityProperty.id),
                });

                // eslint-disable-next-line default-case
                switch (action) {
                    case SecretStorageCommand.ENGINE_KEY_SAVE:
                        message = 'Successfully saved secrets to storage engine.';
                        break;
                    case SecretStorageCommand.ENGINE_KEY_DROP:
                        message = 'Successfully deleted secrets from storage engine.';
                        break;
                }

                this.$emit('updated', station);
            } catch (e) {
                variant = 'danger';
                message = e.message;
            }

            this.$bvToast.toast(message, {
                title,
                autoHideDelay: 5000,
                variant,
                toaster: 'b-toaster-top-center',
            });

            this.busy = false;
        },
        async runRegistryProjectCreate() {
            await this.runRegistryCommand(RegistryCommand.STATION_SAVE);
        },
        async runRegistryProjectDelete() {
            await this.runRegistryCommand(RegistryCommand.STATION_DELETE);
        },
        async runRegistryCommand(command) {
            if (this.busy || !this.isEditing) return;

            this.busy = true;

            const title = 'Registry';
            let message = 'Succeeded...';
            let variant = 'success';

            try {
                await this.$api.service.runRegistryCommand(command, {
                    id: this.entityProperty.id,
                });

                // eslint-disable-next-line default-case
                switch (command) {
                    case RegistryCommand.STATION_SAVE:
                        message = 'Successfully ensured existence of station registry, robot-account & webhook.';
                        break;
                    case RegistryCommand.STATION_DELETE:
                        message = 'Successfully removed station related entities from registry.';

                        this.$emit('updated', {
                            registry_project_id: null,
                            registry_project_account_id: null,
                            registry_project_account_name: null,
                            registry_project_account_token: null,
                            registry_project_webhook_exists: null,
                        });
                        break;
                }
            } catch (e) {
                variant = 'danger';
                message = e.message;
            }

            this.$bvToast.toast(message, {
                title,
                autoHideDelay: 5000,
                variant,
                toaster: 'b-toaster-top-center',
            });

            this.busy = false;
        },
    },
};
</script>
<template>
    <div class="row">
        <div class="col">
            <h6><i class="fa fa-bars" /> General</h6>
            <template v-if="!isRealmLocked">
                <div
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
            </template>

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
                :class="{'alert-danger': hasSecureIdChanged, 'alert-info': !hasSecureIdChanged}"
            >
                <div class="mb-1">
                    <template v-if="hasSecureIdChanged">
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
                    v-if="hasSecureIdChanged"
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
                <label>
                    PublicKey
                    <span
                        v-if="isHexPublicKey"
                        class="text-danger font-weight-bold"
                    >Hex <i class="fa fa-exclamation-triangle" /></span>
                </label>
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

            <div class="d-flex">
                <div>
                    <button
                        type="submit"
                        class="btn btn-outline-primary btn-sm"
                        :disabled="$v.$invalid || busy"
                        @click.prevent="submit"
                    >
                        {{ isEditing ? 'Update' : 'Create' }}
                    </button>
                </div>

                <div class="ml-auto">
                    <button
                        class="btn btn-danger btn-sm"
                        @click.prevent="drop"
                    >
                        <i class="fa fa-trash" /> Delete
                    </button>
                </div>
            </div>
        </div>
        <div
            v-if="isEditing"
            class="col"
        >
            <div class="alert alert-warning">
                The tasks for the <strong>secret-storage</strong> and <strong>registry</strong> are performed
                asynchronously and therefore might take a while, till the view will be updated.
            </div>
            <div class="mb-3">
                <h6><i class="fa fa-key" /> Secret Storage</h6>

                <p class="mb-2">
                    To keep the data between the secret key storage engine and the ui in sync, you can
                    either <strong>pull</strong> existing secrets from the storage engine or <strong>push</strong> local secrets against it.
                </p>

                <p>
                    <strong>Path: </strong> {{ pathName }}
                </p>

                <div class="d-flex flex-row">
                    <div>
                        <button
                            type="button"
                            class="btn btn-primary btn-xs"
                            :disabled="busy"
                            @click.prevent="runSecretStorageEngineKeySave"
                        >
                            <i
                                class="fa fa-save"
                                aria-hidden="true"
                            /> Save
                        </button>
                    </div>
                    <div class="ml-auto">
                        <button
                            type="button"
                            class="btn btn-danger btn-xs"
                            :disabled="busy"
                            @click.prevent="runSecretStorageEngineKeyDelete"
                        >
                            <i class="fa fa-trash" /> Delete
                        </button>
                    </div>
                </div>

                <hr>

                <div class="mb-3">
                    <h6><i class="fa fa-folder-open" /> Registry</h6>

                    <p class="mb-2">
                        To keep the data between the registry and the ui in sync, you can pull all available information about the
                        project, webhook, robot-account,... of a station or create them.
                    </p>

                    <div class="mb-2 d-flex flex-column">
                        <div>
                            <strong>Namespace: </strong>
                            {{ projectName }}

                            <i
                                :class="{
                                    'fa fa-check text-success': entityProperty.registry_project_id,
                                    'fa fa-times text-danger': !entityProperty.registry_project_id
                                }"
                            />
                        </div>
                        <div>
                            <strong>Webhook: </strong>
                            <i
                                :class="{
                                    'fa fa-check text-success': entityProperty.registry_project_webhook_exists,
                                    'fa fa-times text-danger': !entityProperty.registry_project_webhook_exists
                                }"
                            />
                        </div>
                        <div>
                            <strong>Robot: </strong>
                            <i
                                :class="{
                                    'fa fa-check text-success': entityProperty.registry_project_account_id,
                                    'fa fa-times text-danger': !entityProperty.registry_project_account_id
                                }"
                            />
                            <template v-if="entityProperty.registry_project_account_name || entityProperty.registry_project_account_token">
                                <br>
                                <template v-if="entityProperty.registry_project_account_name">
                                    {{ entityProperty.registry_project_account_name }}
                                </template>
                                <br>
                                <template v-if="entityProperty.registry_project_account_token">
                                    {{ entityProperty.registry_project_account_token }}
                                </template>
                            </template>
                        </div>
                    </div>

                    <div class="d-flex flex-row">
                        <div>
                            <button
                                type="button"
                                class="btn btn-primary btn-xs"
                                :disabled="busy"
                                @click.prevent="runRegistryProjectCreate"
                            >
                                <i class="fas fa-save" /> Save
                            </button>
                        </div>
                        <div class="ml-auto">
                            <div v-if="entityProperty.registry_project_id">
                                <button
                                    type="button"
                                    class="btn btn-danger btn-xs"
                                    :disabled="busy"
                                    @click.prevent="runRegistryProjectDelete"
                                >
                                    <i class="fa fa-trash" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
