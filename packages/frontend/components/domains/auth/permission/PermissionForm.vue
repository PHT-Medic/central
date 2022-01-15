<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { maxLength, minLength, required } from 'vuelidate/lib/validators';

import AlertMessage from '../../../alert/AlertMessage';

export default {
    components: {
        AlertMessage,
    },
    props: {
        permissionProperty: {
            type: Object,
            default: undefined,
        },
    },
    data() {
        return {
            formData: {
                id: '',
            },

            busy: false,
            message: null,
        };
    },
    validations: {
        formData: {
            id: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(30),
            },
        },
    },
    computed: {
        isEditing() {
            return typeof this.permissionProperty?.id !== 'undefined';
        },
    },
    created() {
        this.formData.id = this.permissionProperty?.id ?? '';
    },
    methods: {
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
                    response = await this.$authApi.permission.update(this.permissionProperty.id, this.formData);

                    this.message = {
                        isError: false,
                        data: 'The permission was successfully updated.',
                    };

                    this.$emit('updated', response);
                } else {
                    response = await this.$api.permission.create(this.formData);

                    this.message = {
                        isError: false,
                        data: 'The permission was successfully created.',
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
    },
};
</script>
<template>
    <div>
        <alert-message :message="message" />

        <div class="form-group">
            <div
                class="form-group"
                :class="{ 'form-group-error': $v.formData.id.$error }"
            >
                <label>ID</label>
                <input
                    v-model="$v.formData.id.$model"
                    type="text"
                    name="name"
                    class="form-control"
                    placeholder="Name..."
                >

                <div
                    v-if="!$v.formData.id.required"
                    class="form-group-hint group-required"
                >
                    Enter a ID
                </div>
                <div
                    v-if="!$v.formData.id.minLength"
                    class="form-group-hint group-required"
                >
                    The length of the ID must be greater than <strong>{{ $v.formData.id.$params.minLength.min }}</strong> characters
                </div>
                <div
                    v-if="!$v.formData.id.maxLength"
                    class="form-group-hint group-required"
                >
                    The length of the ID must be less than <strong>{{ $v.formData.id.$params.maxLength.max }}</strong> characters.
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
