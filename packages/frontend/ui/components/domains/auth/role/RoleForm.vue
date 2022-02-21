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
        roleProperty: {
            type: Object,
            default: undefined,
        },
    },
    data() {
        return {
            formData: {
                name: '',
            },

            busy: false,
            message: null,
        };
    },
    validations: {
        formData: {
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(30),
            },
        },
    },
    computed: {
        isEditing() {
            return typeof this.roleProperty?.id === 'number';
        },
    },
    created() {
        this.formData.name = this.roleProperty?.name ?? '';
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
                    response = await this.$authApi.role.update(this.roleProperty.id, this.formData);

                    this.message = {
                        isError: false,
                        data: 'The role was successfully updated.',
                    };

                    this.$emit('updated', response);
                } else {
                    response = await this.$authApi.role.create(this.formData);

                    this.message = {
                        isError: false,
                        data: 'The role was successfully created.',
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
                    Enter a name
                </div>
                <div
                    v-if="!$v.formData.name.minLength"
                    class="form-group-hint group-required"
                >
                    The length of the name must be greater than <strong>{{ $v.formData.name.$params.minLength.min }}</strong> characters
                </div>
                <div
                    v-if="!$v.formData.name.maxLength"
                    class="form-group-hint group-required"
                >
                    The length of the name must be greater than <strong>{{ $v.formData.name.$params.maxLength.max }}</strong> characters.
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
