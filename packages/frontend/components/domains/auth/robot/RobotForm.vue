<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    createNanoID,
} from '@typescript-auth/domains';
import {
    helpers, maxLength, minLength, required,
} from 'vuelidate/lib/validators';

const validId = helpers.regex('validId', /^[a-zA-Z0-9_-]*$/);

export default {
    props: {
        nameProperty: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            form: {
                name: '',
                secret: '',
            },
            item: null,
            busy: false,
        };
    },
    validations: {
        form: {
            name: {
                validId,
                required,
                minLength: minLength(3),
                maxLength: maxLength(128),
            },
            secret: {
                minLength: minLength(3),
                maxLength: maxLength(256),
            },
        },
    },
    computed: {
        nameFixed() {
            return !!this.nameProperty && this.nameProperty.length > 0;
        },
        isEditing() {
            return this.item &&
                Object.prototype.hasOwnProperty.call(this.item, 'id');
        },
        isSecretEmpty() {
            return !this.form.secret || this.form.secret.length === 0;
        },
    },
    created() {
        Promise.resolve()
            .then(this.find)
            .then(this.initFromProperties);
    },
    methods: {
        initFromProperties() {
            if (this.nameProperty) {
                this.form.name = this.nameProperty;
            }

            if (this.item) {
                const keys = Object.keys(this.form);
                for (let i = 0; i < keys.length; i++) {
                    if (Object.prototype.hasOwnProperty.call(this.item, keys[i])) {
                        this.form[keys[i]] = this.item[keys[i]];
                    }
                }
            }

            if (this.form.secret.length === 0) {
                this.generateSecret();
            }
        },
        generateSecret() {
            this.form.secret = createNanoID('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_', 128);
        },
        async find() {
            if (this.busy || !this.nameFixed) {
                return;
            }

            this.busy = true;

            try {
                const { data, meta } = await this.$authApi.robot.getMany({
                    filter: {
                        name: this.nameProperty,
                    },
                    fields: ['+secret'],
                });

                if (meta.total === 1) {
                    // eslint-disable-next-line prefer-destructuring
                    this.item = data[0];
                }
            } catch (e) {
                console.log(e);
                // ...
            }

            this.busy = false;
        },

        async save() {
            if (this.busy || this.$v.$invalid) return;

            this.busy = true;

            try {
                let response;

                if (this.isEditing) {
                    response = await this.$authApi.robot.update(this.item.id, {
                        ...this.form,
                    });

                    this.item = response;

                    this.$bvToast.toast('The robot was successfully updated.', {
                        variant: 'success',
                        toaster: 'b-toaster-top-center',
                    });

                    this.$emit('updated', response);
                } else {
                    response = await this.$authApi.robot.create({
                        ...this.form,
                    });

                    this.item = response;

                    this.$bvToast.toast('The robot was successfully created.', {
                        variant: 'success',
                        toaster: 'b-toaster-top-center',
                    });

                    this.$emit('created', response);
                }
            } catch (e) {
                this.$bvToast.toast(e.message, {
                    variant: 'warning',
                    toaster: 'b-toaster-top-center',
                });
            }

            this.busy = false;
        },
        async drop() {
            if (this.busy || !this.item) return;

            this.busy = true;

            try {
                const response = await this.$authApi.robot.delete(this.item.id);
                this.item = null;
                this.$emit('deleted', response);
            } catch (e) {
                this.$bvToast.toast(e.message, {
                    variant: 'warning',
                    toaster: 'b-toaster-top-center',
                });
            }

            this.busy = false;
        },
        close() {
            this.$emit('close');
        },
    },
};
</script>
<template>
    <div>
        <p>
            Robot Credentials (ID & Secret) are required to authenticate and authorize against the API.
        </p>

        <div
            v-if="!busy && !item"
            class="mb-2"
        >
            <button
                type="button"
                class="btn btn-success btn-xs"
                :disabled="busy"
                @click.prevent="save"
            >
                <i class="fa fa-plus" /> Add
            </button>
        </div>

        <hr>

        <template v-if="busy">
            <div class="text-center">
                <div
                    class="spinner-border"
                    role="status"
                >
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </template>
        <template v-else>
            <template v-if="item">
                <h6>Details</h6>

                <div
                    class="form-group"
                    :class="{ 'form-group-error': $v.form.name.$error }"
                >
                    <label>Name</label>
                    <input
                        v-model="$v.form.name.$model"
                        type="text"
                        name="name"
                        class="form-control"
                        :disabled="nameFixed"
                        placeholder="..."
                    >

                    <div
                        v-if="!$v.form.name.required && !$v.form.name.$model"
                        class="form-group-hint group-required"
                    >
                        Enter an identifier.
                    </div>
                    <div
                        v-if="!$v.form.name.validId"
                        class="form-group-hint group-required"
                    >
                        The name is only allowed to consist of the following characters: [0-9a-z]+
                    </div>
                    <div
                        v-if="!$v.form.name.minLength"
                        class="form-group-hint group-required"
                    >
                        The length of the name must be greater than <strong>{{ $v.form.name.$params.minLength.min }}</strong> characters.
                    </div>
                    <div
                        v-if="!$v.form.name.maxLength"
                        class="form-group-hint group-required"
                    >
                        The length of the name must be less than <strong>{{ $v.form.name.$params.maxLength.max }}</strong> characters.
                    </div>
                </div>

                <hr>

                <div class="form-group">
                    <label>ID</label>
                    <input
                        type="text"
                        class="form-control"
                        :disabled="true"
                        :value="item.id"
                    >
                </div>

                <div
                    class="form-group"
                    :class="{ 'form-group-error': $v.form.secret.$error }"
                >
                    <label>Secret</label>
                    <input
                        v-model="$v.form.secret.$model"
                        type="text"
                        name="secret"
                        class="form-control"
                        placeholder="..."
                    >

                    <div
                        v-if="!$v.form.secret.required && !$v.form.secret.$model"
                        class="form-group-hint group-required"
                    >
                        Provide a secret for the robot.
                    </div>
                    <div
                        v-if="!$v.form.secret.minLength"
                        class="form-group-hint group-required"
                    >
                        The length of the secret must be greater than <strong>{{ $v.form.secret.$params.minLength.min }}</strong> characters.
                    </div>
                    <div
                        v-if="!$v.form.secret.maxLength"
                        class="form-group-hint group-required"
                    >
                        The length of the secret must be less than <strong>{{ $v.form.secret.$params.maxLength.max }}</strong> characters.
                    </div>
                </div>
                <div
                    class="alert alert-sm"
                    :class="{
                        'alert-warning': isSecretEmpty,
                        'alert-success': !isSecretEmpty
                    }"
                >
                    <div class="mb-1">
                        If you don't want to chose an secret by your own, you can generate one.
                    </div>
                    <button
                        class="btn btn-dark btn-xs"
                        @click.prevent="generateSecret"
                    >
                        <i class="fa fa-wrench" /> Generate
                    </button>
                </div>

                <hr>

                <div class="d-flex flex-row">
                    <div>
                        <button
                            type="button"
                            class="btn btn-dark btn-xs"
                            :disabled="busy"
                            @click.prevent="save"
                        >
                            <i class="fa fa-save" /> Save
                        </button>
                    </div>
                    <div class="ml-auto">
                        <button
                            type="button"
                            class="btn btn-danger btn-xs"
                            :disabled="busy"
                            @click.prevent="drop"
                        >
                            <i class="fa fa-trash" /> Delete
                        </button>
                    </div>
                </div>
            </template>
        </template>
    </div>
</template>
