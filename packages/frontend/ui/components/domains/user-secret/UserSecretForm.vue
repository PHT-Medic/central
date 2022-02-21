<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    SecretType,
} from '@personalhealthtrain/central-common';
import { maxLength, minLength, required } from 'vuelidate/lib/validators';

import AlertMessage from '../../alert/AlertMessage';

export default {
    components: {
        AlertMessage,
    },
    props: {
        userId: {
            type: String,
            default: undefined,
        },
        entityProperty: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            formData: {
                key: '',
                type: '',
                content: '',
            },

            busy: false,
            message: null,

            typeOptions: [
                { id: SecretType.RSA_PUBLIC_KEY, name: 'RSA' },
                { id: SecretType.PAILLIER_PUBLIC_KEY, name: 'Paillier' },
            ],
        };
    },
    validations: {
        formData: {
            key: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(128),
            },
            content: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(8192),
            },
            type: {
                required,
            },
        },
    },
    computed: {
        isEditing() {
            return this.entityProperty &&
                Object.prototype.hasOwnProperty.call(this.entityProperty, 'id');
        },
    },
    created() {
        this.resetFormData();
    },
    methods: {
        resetFormData() {
            const keys = Object.keys(this.formData);
            for (let i = 0; i < keys.length; i++) {
                if (
                    typeof this.entityProperty !== 'undefined' &&
                    this.entityProperty[keys[i]]
                ) {
                    this.formData[keys[i]] = this.entityProperty[keys[i]];
                } else {
                    switch (keys[i]) {
                        case 'type':
                            this.formData[keys[i]] = SecretType.RSA_PUBLIC_KEY;
                            this.handleTypeChanged({
                                target: {
                                    value: this.formData[keys[i]],
                                },
                            });
                            break;
                        default:
                            this.formData[keys[i]] = '';
                            break;
                    }
                }
            }
        },

        readFile() {
            this.busy = true;

            const file = this.$refs.myFile.files[0];

            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = (evt) => {
                this.formData.content = evt.target.result;
                this.busy = false;
                this.$refs.myFile.value = '';
            };
            reader.onerror = () => {
                this.busy = false;
                this.$refs.myFile.value = '';
            };
        },

        async handleSubmit(e) {
            e.preventDefault();

            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.message = null;
            this.busy = true;

            try {
                let response;

                if (this.isEditing) {
                    response = await this.$api.userSecret.update(this.entityProperty.id, { ...this.formData });

                    this.message = {
                        isError: false,
                        data: 'The user secret was successfully updated.',
                    };

                    this.$emit('updated', response);
                } else {
                    response = await this.$api.userSecret.create({ ...this.formData });

                    this.message = {
                        isError: false,
                        data: 'The user secret was successfully created.',
                    };

                    this.$emit('created', response);
                }
            } catch (e) {
                this.message = {
                    data: e.message,
                    isError: true,
                };
            }

            this.busy = false;
        },

        handleTypeChanged(e) {
            if (
                this.formData.key &&
                this.formData.key !== SecretType.PAILLIER_PUBLIC_KEY &&
                this.formData.key !== SecretType.RSA_PUBLIC_KEY
            ) {
                return;
            }

            this.formData.key = e.target.value;
        },
    },
};
</script>
<template>
    <div>
        <alert-message :message="message" />

        <div>
            <div
                class="form-group"
                :class="{ 'form-group-error': $v.formData.type.$error }"
            >
                <label>Type</label>
                <select
                    v-model="formData.type"
                    class="form-control"
                    @change.prevent="handleTypeChanged"
                >
                    <option value="">
                        ---Select---
                    </option>
                    <option
                        v-for="(item,key) in typeOptions"
                        :key="key"
                        :value="item.id"
                    >
                        {{ item.name }}
                    </option>
                </select>
            </div>

            <div
                class="form-group"
                :class="{ 'form-group-error': $v.formData.key.$error }"
            >
                <label>Key</label>
                <input
                    v-model="$v.formData.key.$model"
                    type="text"
                    name="name"
                    class="form-control"
                    placeholder="..."
                >

                <div
                    v-if="!$v.formData.key.required"
                    class="form-group-hint group-required"
                >
                    Please enter a key.
                </div>
                <div
                    v-if="!$v.formData.key.minLength"
                    class="form-group-hint group-required"
                >
                    The length of the key must be greater than <strong>{{ $v.formData.key.$params.minLength.min }}</strong> characters.
                </div>
                <div
                    v-if="!$v.formData.key.maxLength"
                    class="form-group-hint group-required"
                >
                    The length of the key must be less than<strong>{{ $v.formData.key.$params.maxLength.max }}</strong> characters.
                </div>
            </div>

            <hr>

            <div class="form-group">
                <div class="custom-file">
                    <input
                        ref="myFile"
                        type="file"
                        class="custom-file-input"
                        @change.prevent="readFile"
                    >
                    <label
                        class="custom-file-label"
                    >/**/*.{key,pm}</label>
                </div>
            </div>

            <div
                class="form-group"
                :class="{ 'form-group-error': $v.formData.content.$error }"
            >
                <label>Content</label>
                <textarea
                    v-model="$v.formData.content.$model"
                    class="form-control"
                    rows="8"
                    placeholder="..."
                />

                <div
                    v-if="!$v.formData.content.required"
                    class="form-group-hint group-required"
                >
                    Enter a content
                </div>
                <div
                    v-if="!$v.formData.content.minLength"
                    class="form-group-hint group-required"
                >
                    The length of the content must be greater than <strong>{{ $v.formData.content.$params.minLength.min }}</strong> characters
                </div>
                <div
                    v-if="!$v.formData.content.maxLength"
                    class="form-group-hint group-required"
                >
                    The length of the content must be less than <strong>{{ $v.formData.content.$params.maxLength.max }}</strong> characters.
                </div>
            </div>

            <hr>

            <div class="form-group">
                <button
                    type="submit"
                    class="btn btn-outline-primary btn-sm"
                    :disabled="$v.$invalid || busy"
                    @click="handleSubmit"
                >
                    {{ isEditing ? 'Update' : 'Create' }}
                </button>
            </div>
        </div>
    </div>
</template>
